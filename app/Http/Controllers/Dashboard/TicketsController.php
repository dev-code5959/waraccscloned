<?php
// File: app/Http/Controllers/Dashboard/TicketsController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TicketsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = $user->supportTickets()->with('latestMessage')->latest();

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        // Search by subject or ticket number
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', '%' . $request->search . '%')
                    ->orWhere('ticket_number', 'like', '%' . $request->search . '%');
            });
        }

        $tickets = $query->paginate(15)->through(function ($ticket) {
            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'status_display' => $ticket->status_display,
                'status_badge_class' => $ticket->status_badge_class,
                'priority' => $ticket->priority,
                'priority_display' => $ticket->priority_display,
                'priority_badge_class' => $ticket->priority_badge_class,
                'created_at' => $ticket->created_at,
                'created_at_human' => $ticket->created_at->diffForHumans(),
                'latest_message_at' => $ticket->latestMessage?->created_at?->diffForHumans(),
                'unread_messages' => $ticket->messages()->where('is_staff_reply', true)->where('read_at', null)->count(),
            ];
        });

        // Get summary stats
        $stats = [
            'total_tickets' => $user->supportTickets()->count(),
            'open_tickets' => $user->supportTickets()->whereIn('status', ['open', 'in_progress'])->count(),
            'closed_tickets' => $user->supportTickets()->where('status', 'closed')->count(),
            'pending_reply' => $user->supportTickets()->where('status', 'waiting_for_customer')->count(),
        ];

        // Get filter options
        $filterOptions = [
            'statuses' => [
                'open' => 'Open',
                'in_progress' => 'In Progress',
                'waiting_for_customer' => 'Waiting for Customer',
                'closed' => 'Closed',
            ],
            'priorities' => [
                'low' => 'Low',
                'medium' => 'Medium',
                'high' => 'High',
                'urgent' => 'Urgent',
            ],
        ];

        return Inertia::render('Dashboard/Tickets/Index', [
            'tickets' => $tickets,
            'stats' => $stats,
            'filters' => $request->only(['status', 'priority', 'search']),
            'filter_options' => $filterOptions,
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        // Get user's recent orders for reference
        $recentOrders = $user->orders()
            ->with('product')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'product_name' => $order->product->name,
                    'status' => $order->status,
                    'created_at_human' => $order->created_at->diffForHumans(),
                ];
            });

        $categories = [
            'order_issue' => 'Order Issue',
            'payment_issue' => 'Payment Issue',
            'account_issue' => 'Account Issue',
            'product_issue' => 'Product Issue',
            'billing_issue' => 'Billing Issue',
            'technical_issue' => 'Technical Issue',
            'general_inquiry' => 'General Inquiry',
            'feature_request' => 'Feature Request',
            'other' => 'Other',
        ];

        $priorities = [
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
        ];

        return Inertia::render('Dashboard/Tickets/Create', [
            'recent_orders' => $recentOrders,
            'categories' => $categories,
            'priorities' => $priorities,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string|in:order_issue,payment_issue,account_issue,product_issue,billing_issue,technical_issue,general_inquiry,feature_request,other',
            'priority' => 'required|string|in:low,medium,high,urgent',
            'message' => 'required|string|min:10',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        $user = Auth::user();

        // Verify order belongs to user if provided
        if ($request->order_id) {
            $order = Order::where('id', $request->order_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$order) {
                return back()->withErrors(['order_id' => 'Invalid order selected.']);
            }
        }

        // Generate ticket number
        $ticketNumber = 'TK-' . strtoupper(Str::random(8));

        // Create the ticket
        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'order_id' => $request->order_id,
            'ticket_number' => $ticketNumber,
            'subject' => $request->subject,
            'category' => $request->category,
            'description' => $request->message,
            'priority' => $request->priority,
            'status' => 'open',
        ]);

        // Create the initial message
        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $request->message,
            'is_staff_reply' => false,
        ]);

        return redirect()->route('dashboard.tickets.show', $ticket)
            ->with('success', 'Support ticket created successfully.');
    }

    public function show(SupportTicket $ticket)
    {
        // Ensure user can only view their own tickets
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        // Mark admin messages as read
        $ticket->messages()
            ->where('is_staff_reply', true)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $ticketData = [
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'subject' => $ticket->subject,
            'category' => $ticket->category,
            'category_display' => $ticket->category_display,
            'priority' => $ticket->priority,
            'priority_display' => $ticket->priority_display,
            'priority_badge_class' => $ticket->priority_badge_class,
            'status' => $ticket->status,
            'status_display' => $ticket->status_display,
            'status_badge_class' => $ticket->status_badge_class,
            'created_at' => $ticket->created_at,
            'created_at_formatted' => $ticket->created_at->format('M j, Y \a\t g:i A'),
            'updated_at' => $ticket->updated_at,
            'updated_at_human' => $ticket->updated_at->diffForHumans(),
        ];

        // Get related order if exists
        $relatedOrder = null;
        if ($ticket->order) {
            $relatedOrder = [
                'id' => $ticket->order->id,
                'order_number' => $ticket->order->order_number,
                'product_name' => $ticket->order->product->name,
                'status' => $ticket->order->status,
                'formatted_total' => $ticket->order->formatted_total,
            ];
        }

        // Get messages
        $messages = $ticket->messages()
            ->with('user')
            ->orderBy('created_at')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'is_staff_reply' => $message->is_staff_reply,
                    'created_at' => $message->created_at,
                    'created_at_formatted' => $message->created_at->format('M j, Y \a\t g:i A'),
                    'created_at_human' => $message->created_at->diffForHumans(),
                    'user' => [
                        'name' => $message->user->name,
                        'email' => $message->user->email,
                    ],
                ];
            });

        return Inertia::render('Dashboard/Tickets/Show', [
            'ticket' => $ticketData,
            'related_order' => $relatedOrder,
            'messages' => $messages,
            'can_reply' => in_array($ticket->status, ['open', 'in_progress', 'waiting_for_customer']),
        ]);
    }

    public function addMessage(Request $request, SupportTicket $ticket)
    {
        // Ensure user can only reply to their own tickets
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if ticket is still open for replies
        if (!in_array($ticket->status, ['open', 'in_progress', 'waiting_for_customer'])) {
            return back()->withErrors(['message' => 'Cannot reply to a closed ticket.']);
        }

        $request->validate([
            'message' => 'required|string|min:5',
        ]);

        // Create the message
        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message,
            'is_staff_reply' => false,
        ]);

        // Update ticket status if it was waiting for customer
        if ($ticket->status === 'waiting_for_customer') {
            $ticket->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Message sent successfully.');
    }

    public function close(SupportTicket $ticket)
    {
        // Ensure user can only close their own tickets
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        if ($ticket->status === 'closed') {
            return back()->withErrors(['ticket' => 'Ticket is already closed.']);
        }

        $ticket->update(['status' => 'closed']);

        return redirect()->route('dashboard.tickets.index')
            ->with('success', 'Ticket closed successfully.');
    }
}
