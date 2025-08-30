<?php
// File: app/Http/Controllers/Admin/ReportsController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', '30'); // Default 30 days
        $startDate = Carbon::now()->subDays($period);
        $endDate = Carbon::now();

        // Quick Stats
        $quickStats = $this->getQuickStats($startDate, $endDate);

        // Chart Data
        $chartData = $this->getChartData($startDate, $endDate);

        // Recent Activity
        $recentActivity = $this->getRecentActivity();

        return Inertia::render('Admin/Reports/Index', [
            'quickStats' => $quickStats,
            'chartData' => $chartData,
            'recentActivity' => $recentActivity,
            'period' => $period,
        ]);
    }

    public function sales(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'format' => 'nullable|in:csv',
        ]);

        $startDate = $request->date_from ? Carbon::parse($request->date_from) : Carbon::now()->subDays(30);
        $endDate = $request->date_to ? Carbon::parse($request->date_to) : Carbon::now();

        $salesData = Order::with(['user:id,name,email', 'product:id,name'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($request->format === 'csv') {
            return $this->exportSalesReport($salesData, $startDate, $endDate);
        }

        $salesStats = [
            'total_orders' => $salesData->count(),
            'total_revenue' => $salesData->sum('net_amount'),
            'average_order_value' => $salesData->avg('net_amount'),
            'total_customers' => $salesData->unique('user_id')->count(),
        ];

        return Inertia::render('Admin/Reports/Sales', [
            'salesData' => $salesData,
            'salesStats' => $salesStats,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function users(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'format' => 'nullable|in:csv',
        ]);

        $startDate = $request->date_from ? Carbon::parse($request->date_from) : Carbon::now()->subDays(30);
        $endDate = $request->date_to ? Carbon::parse($request->date_to) : Carbon::now();

        $usersData = User::with(['roles'])
            ->withCount(['orders', 'transactions'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();

        if ($request->format === 'csv') {
            return $this->exportUsersReport($usersData, $startDate, $endDate);
        }

        $userStats = [
            'total_users' => $usersData->count(),
            'verified_users' => $usersData->whereNotNull('email_verified_at')->count(),
            'active_users' => $usersData->where('is_active', true)->count(),
            'users_with_orders' => $usersData->where('orders_count', '>', 0)->count(),
        ];

        return Inertia::render('Admin/Reports/Users', [
            'usersData' => $usersData,
            'userStats' => $userStats,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function products(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'format' => 'nullable|in:csv',
        ]);

        $startDate = $request->date_from ? Carbon::parse($request->date_from) : Carbon::now()->subDays(30);
        $endDate = $request->date_to ? Carbon::parse($request->date_to) : Carbon::now();

        $productsData = Product::with(['category:id,name'])
            ->withCount(['orders' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed');
            }])
            ->orderBy('orders_count', 'desc')
            ->get();

        if ($request->format === 'csv') {
            return $this->exportProductsReport($productsData, $startDate, $endDate);
        }

        $productStats = [
            'total_products' => $productsData->count(),
            'active_products' => $productsData->where('is_active', true)->count(),
            'products_with_sales' => $productsData->where('orders_count', '>', 0)->count(),
            'out_of_stock' => $productsData->where('stock_quantity', 0)->count(),
        ];

        return Inertia::render('Admin/Reports/Products', [
            'productsData' => $productsData->paginate(50),
            'productStats' => $productStats,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function transactions(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'type' => 'nullable|in:deposit,purchase,refund,referral_commission',
            'status' => 'nullable|in:pending,completed,failed,cancelled',
            'format' => 'nullable|in:csv',
        ]);

        $startDate = $request->date_from ? Carbon::parse($request->date_from) : Carbon::now()->subDays(30);
        $endDate = $request->date_to ? Carbon::parse($request->date_to) : Carbon::now();

        $query = Transaction::with(['user:id,name,email', 'order:id,order_number'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactionsData = $query->orderBy('created_at', 'desc')->get();

        if ($request->format === 'csv') {
            return $this->exportTransactionsReport($transactionsData, $startDate, $endDate);
        }

        $transactionStats = [
            'total_transactions' => $transactionsData->count(),
            'completed_transactions' => $transactionsData->where('status', 'completed')->count(),
            'total_volume' => $transactionsData->where('status', 'completed')->sum('amount'),
            'total_fees' => $transactionsData->where('status', 'completed')->sum('fee'),
        ];

        return Inertia::render('Admin/Reports/Transactions', [
            'transactionsData' => $transactionsData->paginate(50),
            'transactionStats' => $transactionStats,
            'filters' => $request->only(['date_from', 'date_to', 'type', 'status']),
        ]);
    }

    public function support(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'status' => 'nullable|in:open,in_progress,waiting_response,resolved,closed',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'format' => 'nullable|in:csv',
        ]);

        $startDate = $request->date_from ? Carbon::parse($request->date_from) : Carbon::now()->subDays(30);
        $endDate = $request->date_to ? Carbon::parse($request->date_to) : Carbon::now();

        $query = SupportTicket::with(['user:id,name,email', 'assignedUser:id,name'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $supportData = $query->orderBy('created_at', 'desc')->get();

        if ($request->format === 'csv') {
            return $this->exportSupportReport($supportData, $startDate, $endDate);
        }

        $supportStats = [
            'total_tickets' => $supportData->count(),
            'open_tickets' => $supportData->whereIn('status', ['open', 'in_progress', 'waiting_response'])->count(),
            'resolved_tickets' => $supportData->whereIn('status', ['resolved', 'closed'])->count(),
            'avg_resolution_time' => $this->calculateAverageResolutionTime($supportData),
        ];

        return Inertia::render('Admin/Reports/Support', [
            'supportData' => $supportData,
            'supportStats' => $supportStats,
            'filters' => $request->only(['date_from', 'date_to', 'status', 'priority']),
        ]);
    }

    private function getQuickStats($startDate, $endDate)
    {
        return [
            'revenue' => [
                'current' => Order::whereBetween('created_at', [$startDate, $endDate])
                    ->where('status', 'completed')
                    ->sum('net_amount'),
                'previous' => Order::whereBetween('created_at', [
                    $startDate->copy()->subDays($endDate->diffInDays($startDate)),
                    $startDate
                ])->where('status', 'completed')->sum('net_amount'),
            ],
            'orders' => [
                'current' => Order::whereBetween('created_at', [$startDate, $endDate])->count(),
                'previous' => Order::whereBetween('created_at', [
                    $startDate->copy()->subDays($endDate->diffInDays($startDate)),
                    $startDate
                ])->count(),
            ],
            'users' => [
                'current' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
                'previous' => User::whereBetween('created_at', [
                    $startDate->copy()->subDays($endDate->diffInDays($startDate)),
                    $startDate
                ])->count(),
            ],
            'support_tickets' => [
                'current' => SupportTicket::whereBetween('created_at', [$startDate, $endDate])->count(),
                'previous' => SupportTicket::whereBetween('created_at', [
                    $startDate->copy()->subDays($endDate->diffInDays($startDate)),
                    $startDate
                ])->count(),
            ],
        ];
    }

    private function getChartData($startDate, $endDate)
    {
        $days = $startDate->diffInDays($endDate);
        $interval = $days > 90 ? 'week' : 'day';

        $revenueData = Order::selectRaw(
            $interval === 'week'
                ? "DATE_FORMAT(created_at, '%Y-%u') as period, SUM(net_amount) as revenue"
                : "DATE(created_at) as period, SUM(net_amount) as revenue"
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        $ordersData = Order::selectRaw(
            $interval === 'week'
                ? "DATE_FORMAT(created_at, '%Y-%u') as period, COUNT(*) as orders"
                : "DATE(created_at) as period, COUNT(*) as orders"
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return [
            'revenue' => $revenueData,
            'orders' => $ordersData,
        ];
    }

    private function getRecentActivity()
    {
        return [
            'recent_orders' => Order::with(['user:id,name', 'product:id,name'])
                ->latest()
                ->take(10)
                ->get(),
            'recent_users' => User::latest()
                ->take(10)
                ->get(),
            'recent_tickets' => SupportTicket::with(['user:id,name'])
                ->latest()
                ->take(10)
                ->get(),
        ];
    }

    private function exportSalesReport($salesData, $startDate, $endDate)
    {
        $filename = 'sales_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($salesData) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Order Number',
                'Customer Name',
                'Customer Email',
                'Product',
                'Quantity',
                'Unit Price',
                'Total Amount',
                'Net Amount',
                'Status',
                'Order Date'
            ]);

            foreach ($salesData as $order) {
                fputcsv($handle, [
                    $order->order_number,
                    $order->user->name ?? 'N/A',
                    $order->user->email ?? 'N/A',
                    $order->product->name ?? 'N/A',
                    $order->quantity,
                    $order->unit_price,
                    $order->total_amount,
                    $order->net_amount,
                    $order->status,
                    $order->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $filename);
    }

    private function exportUsersReport($usersData, $startDate, $endDate)
    {
        $filename = 'users_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($usersData) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'User ID',
                'Name',
                'Email',
                'Role',
                'Email Verified',
                'Balance',
                'Total Orders',
                'Total Transactions',
                'Status',
                'Registration Date'
            ]);

            foreach ($usersData as $user) {
                fputcsv($handle, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->roles->first()->name ?? 'N/A',
                    $user->email_verified_at ? 'Yes' : 'No',
                    $user->balance,
                    $user->orders_count,
                    $user->transactions_count,
                    $user->is_active ? 'Active' : 'Inactive',
                    $user->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $filename);
    }

    private function exportProductsReport($productsData, $startDate, $endDate)
    {
        $filename = 'products_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($productsData) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Product ID',
                'Name',
                'Category',
                'Price',
                'Stock Quantity',
                'Orders Count',
                'Status',
                'Created Date'
            ]);

            foreach ($productsData as $product) {
                fputcsv($handle, [
                    $product->id,
                    $product->name,
                    $product->category->name ?? 'N/A',
                    $product->price,
                    $product->stock_quantity,
                    $product->orders_count,
                    $product->is_active ? 'Active' : 'Inactive',
                    $product->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $filename);
    }

    private function exportTransactionsReport($transactionsData, $startDate, $endDate)
    {
        $filename = 'transactions_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($transactionsData) {
            $handle = fopen('php://output', 'w');

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
                'Order Number',
                'Date'
            ]);

            foreach ($transactionsData as $transaction) {
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
                    $transaction->order->order_number ?? 'N/A',
                    $transaction->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($handle);
        }, $filename);
    }

    private function exportSupportReport($supportData, $startDate, $endDate)
    {
        $filename = 'support_report_' . $startDate->format('Y-m-d') . '_to_' . $endDate->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($supportData) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Ticket Number',
                'User Name',
                'User Email',
                'Subject',
                'Priority',
                'Status',
                'Assigned To',
                'Created Date',
                'Resolved Date'
            ]);

            foreach ($supportData as $ticket) {
                fputcsv($handle, [
                    $ticket->ticket_number,
                    $ticket->user->name ?? 'N/A',
                    $ticket->user->email ?? 'N/A',
                    $ticket->subject,
                    $ticket->priority,
                    $ticket->status,
                    $ticket->assignedUser->name ?? 'Unassigned',
                    $ticket->created_at->format('Y-m-d H:i:s'),
                    $ticket->resolved_at ? $ticket->resolved_at->format('Y-m-d H:i:s') : 'N/A',
                ]);
            }

            fclose($handle);
        }, $filename);
    }

    private function calculateAverageResolutionTime($tickets)
    {
        $resolvedTickets = $tickets->filter(function ($ticket) {
            return $ticket->resolved_at && $ticket->created_at;
        });

        if ($resolvedTickets->isEmpty()) {
            return 'N/A';
        }

        $totalMinutes = $resolvedTickets->sum(function ($ticket) {
            return $ticket->created_at->diffInMinutes($ticket->resolved_at);
        });

        $averageMinutes = $totalMinutes / $resolvedTickets->count();
        $hours = floor($averageMinutes / 60);
        $minutes = $averageMinutes % 60;

        return $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m";
    }
}
