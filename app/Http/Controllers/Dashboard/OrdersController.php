<?php
// File: app/Http/Controllers/Dashboard/OrdersController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class OrdersController extends Controller
{
    public function __construct() {}

    public function index(Request $request)
    {
        $user = Auth::user();

        // Build query
        $query = $user->orders()->with(['product']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($productQuery) use ($search) {
                        $productQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->get('payment_status'));
        }

        // Get paginated results
        $orders = $query->latest()->paginate(15)->withQueryString();

        // Transform data for frontend
        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'product' => [
                    'id' => $order->product->id,
                    'name' => $order->product->name,
                    'slug' => $order->product->slug,
                    'thumbnail' => $order->product->thumbnail,
                ],
                'quantity' => $order->quantity,
                'unit_price' => $order->unit_price,
                'formatted_unit_price' => $order->formatted_unit_price ?? '$' . number_format($order->unit_price, 2),
                'total_amount' => $order->total_amount,
                'formatted_total' => $order->formatted_total ?? '$' . number_format($order->total_amount, 2),
                'discount_amount' => $order->discount_amount ?? 0,
                'formatted_discount' => $order->formatted_discount ?? '$' . number_format($order->discount_amount ?? 0, 2),
                'net_amount' => $order->net_amount,
                'formatted_net_amount' => $order->formatted_net_amount ?? '$' . number_format($order->net_amount, 2),
                'status' => $order->status,
                'status_badge_class' => $order->status_badge_class ?? $this->getStatusBadgeClass($order->status),
                'payment_status' => $order->payment_status,
                'payment_status_badge_class' => $order->payment_status_badge_class ?? $this->getPaymentStatusBadgeClass($order->payment_status),
                'promo_code' => $order->promo_code,
                'created_at' => $order->created_at,
                'created_at_human' => $order->created_at->diffForHumans(),
                'completed_at' => $order->completed_at,
                'completed_at_human' => $order->completed_at?->diffForHumans(),
                'can_be_cancelled' => $order->can_be_cancelled ?? ($order->status === 'pending' && $order->payment_status !== 'paid'),
                'is_completed' => $order->is_completed ?? ($order->status === 'completed'),
            ];
        });

        // Calculate stats
        $stats = [
            'total_orders' => $user->orders()->count(),
            'completed_orders' => $user->orders()->where('status', 'completed')->count(),
            'pending_orders' => $user->orders()->where('status', 'pending')->count(),
            'total_spent' => number_format($user->orders()->where('payment_status', 'paid')->sum('net_amount'), 2)
        ];

        return Inertia::render('Dashboard/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'payment_status' => $request->get('payment_status', ''),
            ],
            'stats' => $stats,
        ]);
    }

    public function show(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['product', 'accessCodes']);

        // Get access codes for this order
        $accessCodes = [];
        if ($order->status === 'completed' && $order->payment_status === 'paid') {
            $accessCodes = $order->accessCodes()->where('status', 'delivered')->get()->map(function ($code) {
                return [
                    'id' => $code->id,
                    'email' => $code->email,
                    'username' => $code->username,
                    'password' => $code->password,
                    'additional_info' => $code->additional_info,
                    'delivered_at' => $code->delivered_at,
                    'status' => $code->status,
                ];
            });
        }

        $orderData = [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'product' => [
                'id' => $order->product->id,
                'name' => $order->product->name,
                'slug' => $order->product->slug,
                'thumbnail' => $order->product->thumbnail,
                'delivery_info' => $order->product->delivery_info,
            ],
            'quantity' => $order->quantity,
            'unit_price' => $order->unit_price,
            'formatted_unit_price' => $order->formatted_unit_price ?? '$' . number_format($order->unit_price, 2),
            'total_amount' => $order->total_amount,
            'formatted_total' => $order->formatted_total ?? '$' . number_format($order->total_amount, 2),
            'discount_amount' => $order->discount_amount ?? 0,
            'formatted_discount' => $order->formatted_discount ?? '$' . number_format($order->discount_amount ?? 0, 2),
            'net_amount' => $order->net_amount,
            'formatted_net_amount' => $order->formatted_net_amount ?? '$' . number_format($order->net_amount, 2),
            'status' => $order->status,
            'status_badge_class' => $order->status_badge_class ?? $this->getStatusBadgeClass($order->status),
            'payment_status' => $order->payment_status,
            'payment_status_badge_class' => $order->payment_status_badge_class ?? $this->getPaymentStatusBadgeClass($order->payment_status),
            'payment_method' => $order->payment_method,
            'payment_reference' => $order->payment_reference ?? $order->transaction_id,
            'transaction_id' => $order->transaction_id,
            'promo_code' => $order->promo_code,
            'notes' => $order->notes,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
            'completed_at' => $order->completed_at,
            'paid_at' => $order->paid_at,
            'created_at_human' => $order->created_at->diffForHumans(),
            'completed_at_human' => $order->completed_at?->diffForHumans(),
            'can_be_cancelled' => $order->can_be_cancelled ?? ($order->status === 'pending' && $order->payment_status !== 'paid'),
            'is_completed' => $order->is_completed ?? ($order->status === 'completed'),
        ];

        return Inertia::render('Dashboard/Orders/Show', [
            'order' => $orderData,
            'accessCodes' => $accessCodes,
        ]);
    }

    public function downloadCredentials(Order $order)
    {
        // Same validation...
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if ($order->status !== 'completed' || $order->payment_status !== 'paid') {
            return redirect()->back()->with('error', 'Order must be completed and paid to download credentials.');
        }

        $accessCodes = $order->accessCodes()
            ->whereIn('status', ['sold', 'delivered'])
            ->get();

        if ($accessCodes->isEmpty()) {
            return redirect()->back()->with('error', 'No credentials available for download.');
        }

        // Generate content
        $content = "Order #" . $order->order_number . " - Digital Products\n";
        $content .= "Product: " . $order->product->name . "\n";
        $content .= "Quantity: " . $order->quantity . "\n";
        $content .= "Download Date: " . now()->format('Y-m-d H:i:s') . "\n";
        $content .= str_repeat("=", 50) . "\n\n";

        foreach ($accessCodes as $index => $code) {
            $content .= "Account #" . ($index + 1) . ":\n";
            $content .= "Email/Username: " . ($code->email ?: ($code->username ?? 'N/A')) . "\n";
            $content .= "Password: " . ($code->password ?: 'N/A') . "\n";
            if ($code->additional_info) {
                if (is_array($code->additional_info)) {
                    $content .= "Additional Info: \n";
                    foreach ($code->additional_info as $key => $value) {
                        $content .= ucfirst($key) . ": " . (is_array($value) ? implode(', ', $value) : $value) . "\n";
                    }
                } else {
                    $content .= "Additional Info: " . $code->additional_info . "\n";
                }
            }
            $content .= "\n" . str_repeat("-", 30) . "\n\n";
        }

        $content .= "\nIMPORTANT NOTES:\n";
        $content .= "- Change passwords immediately after receiving access\n";
        $content .= "- Do not share these credentials with unauthorized persons\n";
        $content .= "- Use these accounts responsibly and follow platform terms\n";
        $content .= "- Contact support if you encounter any issues\n";

        // Return HTML page with automatic download via JavaScript
        $filename = 'order_' . $order->order_number . '_credentials.txt';
        $base64Content = base64_encode($content);

        $html = '<!DOCTYPE html>
    <html>
    <head>
        <title>Downloading...</title>
    </head>
    <body>
        <script>
            // Create download link
            const content = atob("' . $base64Content . '");
            const blob = new Blob([content], { type: "text/plain" });
            const url = window.URL.createObjectURL(blob);

            // Create temporary link and click it
            const a = document.createElement("a");
            a.href = url;
            a.download = "' . $filename . '";
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Close window or redirect back
            setTimeout(() => {
                window.close();
                if (!window.closed) {
                    window.history.back();
                }
            }, 1000);
        </script>
        <p>Your download should start automatically. If not, <a href="#" onclick="history.back()">click here to go back</a>.</p>
    </body>
    </html>';

        return response($html, 200, ['Content-Type' => 'text/html']);
    }

    public function cancel(Request $request, Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if order can be cancelled
        $canBeCancelled = $order->can_be_cancelled ?? ($order->status === 'pending' && $order->payment_status !== 'paid');

        if (!$canBeCancelled) {
            return redirect()->back()->with('error', 'This order cannot be cancelled.');
        }

        // Cancel the order
        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->get('reason', 'Cancelled by customer')
        ]);

        // Release reserved access codes if they exist
        if ($order->accessCodes()->exists()) {
            $order->accessCodes()->update([
                'order_id' => null,
                'status' => 'available',
                'reserved_at' => null
            ]);
        }

        return redirect()->route('dashboard.orders.index')
            ->with('success', 'Order has been cancelled successfully.');
    }

    /**
     * Helper method to get status badge class
     */
    private function getStatusBadgeClass($status)
    {
        switch ($status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Helper method to get payment status badge class
     */
    private function getPaymentStatusBadgeClass($status)
    {
        switch ($status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    public function downloadInvoice(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        // Load order relationships
        $order->load(['product', 'user']);

        // Generate invoice HTML
        $html = $this->generateInvoiceHTML($order);

        // Create filename
        $filename = 'invoice_' . $order->order_number . '.html';

        // Return as download
        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    private function generateInvoiceHTML($order)
    {
        $invoiceDate = $order->created_at->format('M d, Y');
        $dueDate = $order->paid_at ? $order->paid_at->format('M d, Y') : 'Pending';

        return '<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Invoice - ' . $order->order_number . '</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }

                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 40px 20px;
                            background: #fff;
                        }

                        .print-actions {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: #fff;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            z-index: 1000;
                        }

                        .print-btn {
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            margin-right: 10px;
                            transition: background-color 0.2s;
                        }

                        .print-btn:hover {
                            background: #2563eb;
                        }

                        .close-btn {
                            background: #6b7280;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: background-color 0.2s;
                        }

                        .close-btn:hover {
                            background: #4b5563;
                        }

                        .invoice-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 40px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #f1f1f1;
                        }

                        .company-info h1 {
                            font-size: 28px;
                            font-weight: 700;
                            color: #1a1a1a;
                            margin-bottom: 5px;
                        }

                        .company-info p {
                            color: #666;
                            font-size: 14px;
                        }

                        .invoice-meta {
                            text-align: right;
                            font-size: 14px;
                        }

                        .invoice-meta h2 {
                            font-size: 24px;
                            color: #1a1a1a;
                            margin-bottom: 10px;
                        }

                        .invoice-meta p {
                            margin: 5px 0;
                            color: #666;
                        }

                        .invoice-details {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 40px;
                            margin-bottom: 40px;
                        }

                        .bill-to, .payment-info {
                            background: #f9f9f9;
                            padding: 20px;
                            border-radius: 8px;
                        }

                        .bill-to h3, .payment-info h3 {
                            font-size: 16px;
                            margin-bottom: 15px;
                            color: #1a1a1a;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }

                        .bill-to p, .payment-info p {
                            margin: 8px 0;
                            color: #555;
                            font-size: 14px;
                        }

                        .items-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 30px;
                            background: #fff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        }

                        .items-table thead {
                            background: #f8f9fa;
                        }

                        .items-table th,
                        .items-table td {
                            padding: 15px;
                            text-align: left;
                            border-bottom: 1px solid #eee;
                        }

                        .items-table th {
                            font-weight: 600;
                            color: #1a1a1a;
                            font-size: 14px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }

                        .items-table td {
                            color: #555;
                            font-size: 14px;
                        }

                        .items-table .qty,
                        .items-table .price,
                        .items-table .total {
                            text-align: right;
                        }

                        .totals {
                            margin-left: auto;
                            width: 300px;
                        }

                        .totals-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            border-bottom: 1px solid #eee;
                        }

                        .totals-row.final {
                            border-bottom: none;
                            border-top: 2px solid #1a1a1a;
                            font-weight: 700;
                            font-size: 18px;
                            margin-top: 10px;
                            padding-top: 15px;
                            color: #1a1a1a;
                        }

                        .totals-row.discount {
                            color: #16a34a;
                        }

                        .status-badge {
                            display: inline-block;
                            padding: 6px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }

                        .status-paid {
                            background: #dcfce7;
                            color: #166534;
                        }

                        .status-pending {
                            background: #fef3c7;
                            color: #92400e;
                        }

                        .status-cancelled {
                            background: #fee2e2;
                            color: #991b1b;
                        }

                        .footer {
                            margin-top: 50px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                        }

                        @media print {
                            .print-actions {
                                display: none !important;
                            }

                            body {
                                padding: 20px;
                                max-width: none;
                            }

                            .invoice-header {
                                margin-bottom: 30px;
                            }

                            .invoice-details {
                                grid-template-columns: 1fr 1fr;
                                gap: 30px;
                            }
                        }

                        @page {
                            margin: 0.5in;
                            size: A4;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-actions">
                        <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
                        <button class="close-btn" onclick="window.close()">✕ Close</button>
                    </div>

                    <div class="invoice-header">
                        <div class="company-info">
                            <h1>ACCSZone</h1>
                            <p>Premium Digital Products</p>
                            <p>Instant Delivery • Secure Payments</p>
                        </div>
                        <div class="invoice-meta">
                            <h2>INVOICE</h2>
                            <p><strong>Invoice #:</strong> ' . $order->order_number . '</p>
                            <p><strong>Date:</strong> ' . $invoiceDate . '</p>
                            <p><strong>Status:</strong> <span class="status-badge status-' . $order->payment_status . '">' . ucfirst($order->payment_status) . '</span></p>
                        </div>
                    </div>

                    <div class="invoice-details">
                        <div class="bill-to">
                            <h3>Bill To</h3>
                            <p><strong>' . htmlspecialchars($order->user->name) . '</strong></p>
                            <p>' . htmlspecialchars($order->user->email) . '</p>
                            <p>Customer ID: #' . $order->user->id . '</p>
                        </div>

                        <div class="payment-info">
                            <h3>Payment Information</h3>
                            <p><strong>Payment Method:</strong> ' . ucfirst($order->payment_method ?? 'Pending') . '</p>
                            <p><strong>Payment Date:</strong> ' . $dueDate . '</p>
                            ' . ($order->payment_reference ? '<p><strong>Reference:</strong> ' . htmlspecialchars($order->payment_reference) . '</p>' : '') . '
                            <p><strong>Order Date:</strong> ' . $invoiceDate . '</p>
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="qty">Qty</th>
                                <th class="price">Unit Price</th>
                                <th class="total">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>' . htmlspecialchars($order->product->name) . '</strong><br>
                                    <small style="color: #999;">' . htmlspecialchars($order->product->category->name ?? 'Digital Product') . '</small>
                                </td>
                                <td class="qty">' . $order->quantity . '</td>
                                <td class="price">$' . number_format($order->unit_price, 2) . '</td>
                                <td class="total">$' . number_format($order->total_amount, 2) . '</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="totals-row">
                            <span>Subtotal:</span>
                            <span>$' . number_format($order->total_amount, 2) . '</span>
                        </div>
                        ' . ($order->discount_amount > 0 ? '
                        <div class="totals-row discount">
                            <span>Discount' . ($order->promo_code ? ' (' . $order->promo_code . ')' : '') . ':</span>
                            <span>-$' . number_format($order->discount_amount, 2) . '</span>
                        </div>' : '') . '
                        <div class="totals-row final">
                            <span>Total:</span>
                            <span>$' . number_format($order->net_amount, 2) . '</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>For support, please contact us through your dashboard or email support.</p>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                    </div>

                    <script>
                        // Auto-focus for better print experience
                        window.addEventListener("load", function() {
                            // Optional: Auto-print when page loads (uncomment if desired)
                            // setTimeout(() => window.print(), 500);
                        });

                        // Handle print completion
                        window.addEventListener("afterprint", function() {
                            // Optional: Auto-close after printing (uncomment if desired)
                            // setTimeout(() => window.close(), 1000);
                        });
                    </script>
                </body>
                </html>';
    }
}
