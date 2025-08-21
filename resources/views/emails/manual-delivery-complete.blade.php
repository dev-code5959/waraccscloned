{{-- File: resources/views/emails/manual-delivery-complete.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order is Ready</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #1e1e2d;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
        }
        .order-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .order-details h3 {
            margin-top: 0;
            color: #1e1e2d;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            color: #1e1e2d;
        }
        .attachment-info {
            background-color: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .attachment-info h4 {
            margin-top: 0;
            color: #1e40af;
        }
        .important-notes {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .important-notes h4 {
            margin-top: 0;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
        }
        .btn:hover {
            background-color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ACCSZone</div>
            <div class="subtitle">Premium Digital Products</div>
        </div>

        <div style="text-align: center;">
            <h2>Your Order is Ready!</h2>
            <div class="status-badge">✓ DELIVERED</div>
        </div>

        <p>Hello {{ $customerName }},</p>

        <p>Great news! Your manual delivery order has been processed and your digital products are now ready. Our team has carefully prepared your order and attached the files to this email.</p>

        <div class="order-details">
            <h3>Order Details</h3>
            <div class="detail-row">
                <span>Order Number:</span>
                <span><strong>{{ $orderNumber }}</strong></span>
            </div>
            <div class="detail-row">
                <span>Product:</span>
                <span>{{ $productName }}</span>
            </div>
            <div class="detail-row">
                <span>Quantity:</span>
                <span>{{ $quantity }}</span>
            </div>
            <div class="detail-row">
                <span>Total Amount:</span>
                <span>{{ $totalAmount }}</span>
            </div>
        </div>

        @if($hasAttachments)
        <div class="attachment-info">
            <h4>📎 Attached Files</h4>
            <p>This email contains <strong>{{ $fileCount }}</strong> attachment(s) with your digital products. Please download and save these files to a secure location.</p>
            <p><strong>File Security:</strong> These files contain sensitive information. Please keep them secure and do not share with unauthorized individuals.</p>
        </div>
        @endif

        <div class="important-notes">
            <h4>⚠️ Important Instructions</h4>
            <ul>
                <li><strong>Download immediately:</strong> Save all attached files to your device right away</li>
                <li><strong>Change passwords:</strong> If the files contain account credentials, change passwords immediately after first login</li>
                <li><strong>Secure storage:</strong> Store these files in a secure, password-protected location</li>
                <li><strong>No sharing:</strong> Do not share these credentials with unauthorized persons</li>
                <li><strong>Follow terms:</strong> Use accounts responsibly and follow platform terms of service</li>
            </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.url') }}/dashboard/orders/{{ $order->id }}" class="btn">View Order Details</a>
        </div>

        <p>If you have any questions or need assistance with your digital products, please don't hesitate to contact our support team through your dashboard.</p>

        <p>Thank you for choosing ACCSZone!</p>

        <div class="footer">
            <p>This email was sent regarding your order #{{ $orderNumber }}</p>
            <p>If you did not place this order, please contact support immediately.</p>
            <p>&copy; {{ date('Y') }} ACCSZone. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
