<?php
// File: app/Http/Controllers/Admin/AdminDashboardController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Transaction;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Date range for analytics (default to last 30 days)
        $startDate = $request->get('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        // Basic stats
        $stats = [
            'total_users' => User::count(),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'total_products' => Product::count(),
            'active_products' => Product::active()->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'total_revenue' => Order::where('status', 'completed')->sum('total_amount'),
            'revenue_today' => Order::where('status', 'completed')
                ->whereDate('created_at', today())
                ->sum('total_amount'),
            'open_tickets' => SupportTicket::whereIn('status', ['open', 'in_progress'])->count(),
            'pending_transactions' => Transaction::where('status', 'pending')->count(),
        ];

        // Revenue chart data (last 30 days)
        $revenueData = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as revenue'),
            DB::raw('COUNT(*) as orders')
        )
            ->where('status', 'completed')
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Orders by status
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Top selling products
        $topProducts = Product::select('products.*', DB::raw('SUM(orders.quantity) as total_sold'))
            ->join('orders', 'products.id', '=', 'orders.product_id')
            ->where('orders.status', 'completed')
            ->groupBy('products.id')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        // Recent orders
        $recentOrders = Order::with(['user', 'product'])
            ->latest()
            ->limit(10)
            ->get();

        // Recent users
        $recentUsers = User::latest()
            ->limit(10)
            ->get();

        // Low stock products
        $lowStockProducts = Product::where('stock_quantity', '<=', 10)
            ->where('stock_quantity', '>', 0)
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get();

        // Out of stock products
        $outOfStockProducts = Product::where('stock_quantity', 0)
            ->where('is_active', true)
            ->count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'revenueData' => $revenueData,
            'ordersByStatus' => $ordersByStatus,
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'recentUsers' => $recentUsers,
            'lowStockProducts' => $lowStockProducts,
            'outOfStockProducts' => $outOfStockProducts,
            'dateRange' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ]
        ]);
    }
}
