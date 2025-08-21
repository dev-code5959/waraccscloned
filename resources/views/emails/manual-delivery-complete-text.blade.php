{{-- File: resources/views/emails/manual-delivery-complete-text.blade.php --}}
ACCSZone - Your Order is Ready!

Hello {{ $customerName }},

Great news! Your manual delivery order has been processed and your digital products are now ready. Our team has carefully prepared your order and attached the files to this email.

ORDER DETAILS
=============
Order Number: {{ $orderNumber }}
Product: {{ $productName }}
Quantity: {{ $quantity }}
Total Amount: {{ $totalAmount }}

@if($hasAttachments)
ATTACHED FILES
==============
This email contains {{ $fileCount }} attachment(s) with your digital products. Please download and save these files to a secure location.

File Security: These files contain sensitive information. Please keep them secure and do not share with unauthorized individuals.
@endif

IMPORTANT INSTRUCTIONS
======================
- Download immediately: Save all attached files to your device right away
- Change passwords: If the files contain account credentials, change passwords immediately after first login
- Secure storage: Store these files in a secure, password-protected location
- No sharing: Do not share these credentials with unauthorized persons
- Follow terms: Use accounts responsibly and follow platform terms of service

If you have any questions or need assistance with your digital products, please don't hesitate to contact our support team through your dashboard.

View your order details: {{ config('app.url') }}/dashboard/orders/{{ $order->id }}

Thank you for choosing ACCSZone!

---
This email was sent regarding your order #{{ $orderNumber }}
If you did not place this order, please contact support immediately.

© {{ date('Y') }} ACCSZone. All rights reserved.
