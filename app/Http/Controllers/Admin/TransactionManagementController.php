<?php
// File: app/Http/Controllers/Admin/TransactionManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class TransactionManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user:id,name,email', 'order:id,order_number']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('gateway_transaction_id', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // User filter
        if ($request->filled('user')) {
            $query->where('user_id', $request->user);
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Gateway filter
        if ($request->filled('gateway')) {
            $query->where('gateway', $request->gateway);
        }

        // Amount range filter
        if ($request->filled('amount_from')) {
            $query->where('amount', '>=', $request->amount_from);
        }
        if ($request->filled('amount_to')) {
            $query->where('amount', '<=', $request->amount_to);
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
        $query->orderBy($sortField, $sortDirection);

        $transactions = $query->paginate(15)->withQueryString();

        // Get stats for dashboard
        $stats = [
            'total_transactions' => Transaction::count(),
            'completed_transactions' => Transaction::where('status', 'completed')->count(),
            'pending_transactions' => Transaction::where('status', 'pending')->count(),
            'failed_transactions' => Transaction::where('status', 'failed')->count(),
            'total_volume' => Transaction::where('status', 'completed')->sum('amount'),
            'total_fees' => Transaction::where('status', 'completed')->sum('fee'),
            'today_transactions' => Transaction::whereDate('created_at', today())->count(),
            'today_volume' => Transaction::whereDate('created_at', today())->where('status', 'completed')->sum('amount'),
        ];

        // Get unique gateways for filter
        $gateways = Transaction::whereNotNull('gateway')->distinct()->pluck('gateway');

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'gateways' => $gateways,
            'filters' => $request->only(['search', 'user', 'type', 'status', 'gateway', 'amount_from', 'amount_to', 'date_from', 'date_to', 'sort', 'direction']),
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'order.product']);

        // Get related transactions (same user, recent)
        $relatedTransactions = Transaction::where('user_id', $transaction->user_id)
            ->where('id', '!=', $transaction->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction,
            'relatedTransactions' => $relatedTransactions,
        ]);
    }

    public function create(Request $request)
    {
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Transactions/Create', [
            'users' => $users,
            'selectedUserId' => $request->get('user_id'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:deposit,purchase,refund,referral_commission',
            'amount' => 'required|numeric',
            'fee' => 'nullable|numeric|min:0',
            'description' => 'required|string|max:255',
            'status' => 'required|in:pending,completed,failed,cancelled',
        ]);

        DB::beginTransaction();

        try {
            $fee = $request->fee ?? 0;
            $netAmount = $request->amount - $fee;

            $transaction = Transaction::create([
                'transaction_id' => Transaction::generateTransactionId(),
                'user_id' => $request->user_id,
                'type' => $request->type,
                'amount' => $request->amount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'status' => $request->status,
                'description' => $request->description,
                'gateway' => 'manual',
            ]);

            // Update user balance if transaction is completed and adds to balance
            if ($request->status === 'completed' && in_array($request->type, ['deposit', 'refund']) && $netAmount > 0) {
                $user = User::find($request->user_id);
                $user->increment('balance', $netAmount);
            }

            // For purchase transactions, deduct from balance
            if ($request->status === 'completed' && $request->type === 'purchase' && $request->amount > 0) {
                $user = User::find($request->user_id);
                $user->decrement('balance', abs($request->amount));
            }

            // Log the action
            activity()
                ->performedOn($transaction)
                ->causedBy(auth()->user())
                ->withProperties([
                    'type' => $request->type,
                    'amount' => $request->amount,
                    'status' => $request->status
                ])
                ->log('Manual transaction created');

            DB::commit();

            return redirect()->route('admin.transactions.show', $transaction)
                ->with('success', 'Transaction created successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to create transaction: ' . $e->getMessage()
            ]);
        }
    }

    public function approve(Transaction $transaction)
    {
        if ($transaction->status !== 'pending') {
            return back()->withErrors([
                'error' => 'Only pending transactions can be approved.'
            ]);
        }

        DB::beginTransaction();

        try {
            $transaction->update(['status' => 'completed']);

            // Update user balance for deposits and refunds
            if (in_array($transaction->type, ['deposit', 'refund']) && $transaction->net_amount > 0) {
                $transaction->user->increment('balance', $transaction->net_amount);
            }

            // Log the action
            activity()
                ->performedOn($transaction)
                ->causedBy(auth()->user())
                ->log('Transaction approved');

            DB::commit();

            return back()->with('success', 'Transaction approved successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to approve transaction: ' . $e->getMessage()
            ]);
        }
    }

    public function reject(Request $request, Transaction $transaction)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($transaction->status !== 'pending') {
            return back()->withErrors([
                'error' => 'Only pending transactions can be rejected.'
            ]);
        }

        $transaction->update([
            'status' => 'failed',
            'description' => $transaction->description . " | Rejected: " . $request->reason,
        ]);

        // Log the action
        activity()
            ->performedOn($transaction)
            ->causedBy(auth()->user())
            ->withProperties(['reason' => $request->reason])
            ->log('Transaction rejected');

        return back()->with('success', 'Transaction rejected successfully.');
    }

    public function cancel(Request $request, Transaction $transaction)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (!in_array($transaction->status, ['pending', 'completed'])) {
            return back()->withErrors([
                'error' => 'Only pending or completed transactions can be cancelled.'
            ]);
        }

        DB::beginTransaction();

        try {
            // If cancelling a completed transaction that added to balance, reverse it
            if (
                $transaction->status === 'completed' &&
                in_array($transaction->type, ['deposit', 'refund']) &&
                $transaction->net_amount > 0
            ) {

                if ($transaction->user->balance < $transaction->net_amount) {
                    return back()->withErrors([
                        'error' => 'Cannot cancel transaction: User balance is insufficient to reverse this transaction.'
                    ]);
                }

                $transaction->user->decrement('balance', $transaction->net_amount);
            }

            // If cancelling a completed purchase transaction, restore balance
            if (
                $transaction->status === 'completed' &&
                $transaction->type === 'purchase' &&
                $transaction->amount > 0
            ) {
                $transaction->user->increment('balance', abs($transaction->amount));
            }

            $transaction->update([
                'status' => 'cancelled',
                'description' => $transaction->description . " | Cancelled: " . $request->reason,
            ]);

            // Log the action
            activity()
                ->performedOn($transaction)
                ->causedBy(auth()->user())
                ->withProperties(['reason' => $request->reason])
                ->log('Transaction cancelled');

            DB::commit();

            return back()->with('success', 'Transaction cancelled successfully.');
        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to cancel transaction: ' . $e->getMessage()
            ]);
        }
    }

    public function retry(Transaction $transaction)
    {
        if ($transaction->status !== 'failed') {
            return back()->withErrors([
                'error' => 'Only failed transactions can be retried.'
            ]);
        }

        // Reset transaction to pending
        $transaction->update([
            'status' => 'pending',
            'gateway_response' => null,
        ]);

        // Log the action
        activity()
            ->performedOn($transaction)
            ->causedBy(auth()->user())
            ->log('Transaction retry initiated');

        return back()->with('success', 'Transaction reset to pending for retry.');
    }

    public function export(Request $request)
    {
        $request->validate([
            'format' => 'required|in:csv,xlsx',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $query = Transaction::with(['user:id,name,email', 'order:id,order_number']);

        // Apply filters
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        $filename = 'transactions_' . now()->format('Y-m-d_H-i-s') . '.' . $request->format;

        if ($request->format === 'csv') {
            return response()->streamDownload(function () use ($transactions) {
                $handle = fopen('php://output', 'w');

                // CSV Headers
                fputcsv($handle, [
                    'Transaction ID',
                    'User Name',
                    'User Email',
                    'Type',
                    'Amount',
                    'Fee',
                    'Net Amount',
                    'Status',
                    'Gateway',
                    'Gateway Transaction ID',
                    'Order Number',
                    'Description',
                    'Created At',
                ]);

                // CSV Data
                foreach ($transactions as $transaction) {
                    fputcsv($handle, [
                        $transaction->transaction_id,
                        $transaction->user->name ?? 'N/A',
                        $transaction->user->email ?? 'N/A',
                        $transaction->type,
                        $transaction->amount,
                        $transaction->fee,
                        $transaction->net_amount,
                        $transaction->status,
                        $transaction->gateway ?? 'N/A',
                        $transaction->gateway_transaction_id ?? 'N/A',
                        $transaction->order->order_number ?? 'N/A',
                        $transaction->description,
                        $transaction->created_at->format('Y-m-d H:i:s'),
                    ]);
                }

                fclose($handle);
            }, $filename, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        }

        // For XLSX format, you would need to use a package like maatwebsite/excel
        return back()->withErrors(['error' => 'XLSX export not implemented yet.']);
    }

    public function getAnalytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $startDate = Carbon::now()->subDays($period);

        $analytics = [
            'transaction_volume' => Transaction::where('created_at', '>=', $startDate)
                ->where('status', 'completed')
                ->selectRaw('DATE(created_at) as date, SUM(amount) as volume, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'transaction_types' => Transaction::where('created_at', '>=', $startDate)
                ->where('status', 'completed')
                ->selectRaw('type, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('type')
                ->get(),

            'transaction_status' => Transaction::where('created_at', '>=', $startDate)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),

            'gateway_performance' => Transaction::where('created_at', '>=', $startDate)
                ->whereNotNull('gateway')
                ->selectRaw('gateway, COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed')
                ->groupBy('gateway')
                ->get(),
        ];

        return response()->json($analytics);
    }
}
