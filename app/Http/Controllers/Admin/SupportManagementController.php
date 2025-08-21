<?php
// File: app/Http/Controllers/Admin/SupportManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SupportManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user:id,name,email', 'order:id,order_number', 'assignedUser:id,name', 'latestMessage']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Priority filter
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Assignment filter
        if ($request->filled('assigned')) {
            if ($request->assigned === 'unassigned') {
                $query->whereNull('assigned_to');
            } elseif ($request->assigned === 'assigned') {
                $query->whereNotNull('assigned_to');
            } elseif ($request->assigned === 'mine') {
                $query->where('assigned_to', auth()->id());
            }
        }

        // User filter
        if ($request->filled('user')) {
            $query->where('user_id', $request->user);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // Handle priority sorting with custom order
        if ($sortField === 'priority') {
            $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low') " . $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $tickets = $query->paginate(15)->withQueryString();

        // Get stats for dashboard
        $stats = [
            'total_tickets' => SupportTicket::count(),
            'open_tickets' => SupportTicket::whereIn('status', ['open', 'in_progress', 'waiting_response'])->count(),
            'unassigned_tickets' => SupportTicket::whereNull('assigned_to')->where('status', '!=', 'closed')->count(),
            'urgent_tickets' => SupportTicket::where('priority', 'urgent')->whereIn('status', ['open', 'in_progress', 'waiting_response'])->count(),
            'my_tickets' => SupportTicket::where('assigned_to', auth()->id())->whereIn('status', ['open', 'in_progress', 'waiting_response'])->count(),
            'resolved_today' => SupportTicket::whereDate('resolved_at', today())->count(),
            'avg_response_time' => $this->getAverageResponseTime(),
            'tickets_today' => SupportTicket::whereDate('created_at', today())->count(),
        ];

        // Get staff users for assignment
        $staffUsers = User::role(['admin', 'support'])->select('id', 'name')->get();

        return Inertia::render('Admin/Support/Index', [
            'tickets' => $tickets,
            'stats' => $stats,
            'staffUsers' => $staffUsers,
            'filters' => $request->only(['search', 'status', 'priority', 'assigned', 'user', 'date_from', 'date_to', 'sort', 'direction']),
        ]);
    }

    public function show(SupportTicket $ticket)
    {
        $ticket->load([
            'user',
            'order.product',
            'assignedUser',
            'messages' => function ($query) {
                $query->with('user')->orderBy('created_at', 'asc');
            }
        ]);

        // Mark messages as read (you might want to implement proper read tracking)
        $ticket->messages()->whereNull('read_at')->update(['read_at' => now()]);

        // Get staff users for assignment
        $staffUsers = User::role(['admin', 'support'])->select('id', 'name')->get();

        return Inertia::render('Admin/Support/Show', [
            'ticket' => $ticket,
            'staffUsers' => $staffUsers,
        ]);
    }

    public function assign(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        // Verify the user has admin or support role
        $assignedUser = User::find($request->assigned_to);
        if (!$assignedUser->hasRole(['admin', 'support'])) {
            return back()->withErrors(['error' => 'Only admin or support staff can be assigned to tickets.']);
        }

        $ticket->assignTo($request->assigned_to);

        // Log the assignment
        activity()
            ->performedOn($ticket)
            ->causedBy(auth()->user())
            ->withProperties([
                'assigned_to' => $assignedUser->name,
                'previous_assignee' => $ticket->assignedUser?->name
            ])
            ->log('Ticket assigned');

        return back()->with('success', 'Ticket assigned successfully.');
    }

    public function updateStatus(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,waiting_response,resolved,closed',
        ]);

        $oldStatus = $ticket->status;

        switch ($request->status) {
            case 'in_progress':
                $ticket->markAsInProgress();
                break;
            case 'waiting_response':
                $ticket->markAsWaitingResponse();
                break;
            case 'resolved':
                $ticket->markAsResolved();
                break;
            case 'closed':
                $ticket->markAsClosed();
                break;
            default:
                $ticket->update(['status' => $request->status]);
        }

        // Log the status change
        activity()
            ->performedOn($ticket)
            ->causedBy(auth()->user())
            ->withProperties([
                'old_status' => $oldStatus,
                'new_status' => $request->status
            ])
            ->log('Ticket status updated');

        return back()->with('success', 'Ticket status updated successfully.');
    }

    public function updatePriority(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $oldPriority = $ticket->priority;
        $ticket->update(['priority' => $request->priority]);

        // Log the priority change
        activity()
            ->performedOn($ticket)
            ->causedBy(auth()->user())
            ->withProperties([
                'old_priority' => $oldPriority,
                'new_priority' => $request->priority
            ])
            ->log('Ticket priority updated');

        return back()->with('success', 'Ticket priority updated successfully.');
    }

    public function reply(Request $request, SupportTicket $ticket)
    {
        $request->validate([
            'message' => 'required|string|min:1',
            'status' => 'nullable|in:open,in_progress,waiting_response,resolved,closed',
            'attachments.*' => 'nullable|file|max:10240', // 10MB max per file
        ]);

        DB::beginTransaction();

        try {
            // Create the message
            $message = $ticket->addMessage(
                $request->message,
                auth()->id(),
                true // is_staff_reply
            );

            // Handle file attachments if any
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $image) {
                    $message->addMedia($image)
                        ->toMediaCollection('attachments');
                }
            }


            // Update status if provided
            if ($request->filled('status')) {
                $this->updateStatus($request, $ticket);
            }

            // Auto-assign ticket to current user if unassigned
            if (!$ticket->assigned_to) {
                $ticket->assignTo(auth()->id());
            }

            // Log the reply
            activity()
                ->performedOn($ticket)
                ->causedBy(auth()->user())
                ->log('Staff reply added to ticket');

            DB::commit();

            return back()->with('success', 'Reply sent successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Failed to send reply: ' . $e->getMessage());

            return back()->withErrors([
                'error' => 'Failed to send reply: ' . $e->getMessage()
            ]);
        }
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:assign,status,priority,delete',
            'ticket_ids' => 'required|array',
            'ticket_ids.*' => 'exists:support_tickets,id',
            'value' => 'required_unless:action,delete',
        ]);

        $tickets = SupportTicket::whereIn('id', $request->ticket_ids);
        $count = $tickets->count();

        DB::beginTransaction();

        try {
            switch ($request->action) {
                case 'assign':
                    $assignedUser = User::find($request->value);
                    if (!$assignedUser->hasRole(['admin', 'support'])) {
                        throw new \Exception('Invalid user for assignment.');
                    }

                    $tickets->update(['assigned_to' => $request->value]);
                    $message = "Assigned {$count} tickets to {$assignedUser->name}";
                    break;

                case 'status':
                    $tickets->update(['status' => $request->value]);
                    if ($request->value === 'resolved') {
                        $tickets->update(['resolved_at' => now()]);
                    }
                    $message = "Updated status of {$count} tickets to {$request->value}";
                    break;

                case 'priority':
                    $tickets->update(['priority' => $request->value]);
                    $message = "Updated priority of {$count} tickets to {$request->value}";
                    break;

                case 'delete':
                    // Only allow deletion of closed tickets
                    $deletableTickets = $tickets->where('status', 'closed');
                    $deleteCount = $deletableTickets->count();
                    $deletableTickets->delete();
                    $message = "Deleted {$deleteCount} closed tickets";
                    break;
            }

            // Log bulk action
            activity()
                ->causedBy(auth()->user())
                ->withProperties([
                    'action' => $request->action,
                    'ticket_count' => $count,
                    'value' => $request->value ?? null
                ])
                ->log('Bulk action performed on tickets');

            DB::commit();

            return back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Bulk action failed: ' . $e->getMessage()
            ]);
        }
    }

    public function export(Request $request)
    {
        $request->validate([
            'format' => 'required|in:csv,xlsx',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'status' => 'nullable|in:open,in_progress,waiting_response,resolved,closed',
        ]);

        $query = SupportTicket::with(['user:id,name,email', 'assignedUser:id,name']);

        // Apply filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();

        $filename = 'support_tickets_' . now()->format('Y-m-d_H-i-s') . '.' . $request->format;

        return response()->streamDownload(function () use ($tickets) {
            $handle = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($handle, [
                'Ticket Number',
                'User Name',
                'User Email',
                'Subject',
                'Priority',
                'Status',
                'Assigned To',
                'Created At',
                'Resolved At',
                'Response Time',
            ]);

            // CSV Data
            foreach ($tickets as $ticket) {
                fputcsv($handle, [
                    $ticket->ticket_number,
                    $ticket->user->name ?? 'N/A',
                    $ticket->user->email ?? 'N/A',
                    $ticket->subject,
                    $ticket->priority,
                    $ticket->status,
                    $ticket->assignedUser->name ?? 'Unassigned',
                    $ticket->created_at->format('Y-m-d H:i:s'),
                    $ticket->resolved_at?->format('Y-m-d H:i:s') ?? 'N/A',
                    $ticket->response_time,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function getAnalytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $startDate = Carbon::now()->subDays($period);

        $analytics = [
            'ticket_volume' => SupportTicket::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'status_distribution' => SupportTicket::where('created_at', '>=', $startDate)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),

            'priority_distribution' => SupportTicket::where('created_at', '>=', $startDate)
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->get(),

            'resolution_times' => SupportTicket::where('created_at', '>=', $startDate)
                ->whereNotNull('resolved_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours')
                ->first(),

            'staff_performance' => SupportTicket::where('created_at', '>=', $startDate)
                ->whereNotNull('assigned_to')
                ->with('assignedUser:id,name')
                ->selectRaw('assigned_to, COUNT(*) as total, SUM(CASE WHEN status IN ("resolved", "closed") THEN 1 ELSE 0 END) as resolved')
                ->groupBy('assigned_to')
                ->get(),
        ];

        return response()->json($analytics);
    }

    private function getAverageResponseTime()
    {
        // Calculate average time to first staff response
        $avgMinutes = DB::table('support_tickets')
            ->join('ticket_messages', 'support_tickets.id', '=', 'ticket_messages.ticket_id')
            ->where('ticket_messages.is_staff_reply', true)
            ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, support_tickets.created_at, ticket_messages.created_at)) as avg_minutes')
            ->value('avg_minutes');

        if (!$avgMinutes) {
            return 'N/A';
        }

        $hours = floor($avgMinutes / 60);
        $minutes = $avgMinutes % 60;

        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }

        return "{$minutes}m";
    }
}
