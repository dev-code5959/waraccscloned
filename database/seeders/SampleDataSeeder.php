<?php
// File: database/seeders/SampleDataSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\AccessCode;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Models\Category;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create products with access codes
        $this->createProductsWithAccessCodes();

        // Create sample orders and transactions
        $this->createSampleOrders();

        // Create sample support tickets
        $this->createSampleTickets();
    }

    private function createProductsWithAccessCodes(): void
    {
        // Get categories for products
        $categories = Category::whereNotNull('parent_id')->get();

        foreach ($categories as $category) {
            // Create 3-8 products per category
            $productCount = rand(3, 8);

            for ($i = 0; $i < $productCount; $i++) {
                $product = Product::factory()
                    ->state(['category_id' => $category->id])
                    ->create();

                // Create access codes for each product (5-50 codes)
                $codeCount = rand(5, 50);
                AccessCode::factory($codeCount)
                    ->forProduct($product)
                    ->create();

                // Update product stock based on available access codes
                $product->updateStock();

                // Make some codes sold
                if (rand(1, 10) > 3) { // 70% chance
                    $soldCount = rand(1, min($codeCount - 1, 20));
                    AccessCode::where('product_id', $product->id)
                        ->available()
                        ->limit($soldCount)
                        ->update([
                            'status' => 'sold',
                            'sold_at' => fake()->dateTimeBetween('-6 months', 'now'),
                        ]);

                    $product->increment('sold_count', $soldCount);
                    $product->updateStock();
                }
            }
        }
    }

    private function createSampleOrders(): void
    {
        $customers = User::role('customer')->get();
        $products = Product::where('stock_quantity', '>', 0)->get();

        foreach ($customers as $customer) {
            // Each customer has 0-5 orders
            $orderCount = rand(0, 5);

            for ($i = 0; $i < $orderCount; $i++) {
                $product = $products->random();
                $quantity = rand(1, min(3, $product->stock_quantity));

                $order = Order::create([
                    'order_number' => Order::generateOrderNumber(),
                    'user_id' => $customer->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                    'total_amount' => $product->price * $quantity,
                    'status' => fake()->randomElement(['pending', 'processing', 'completed', 'completed', 'completed']), // More completed orders
                    'payment_status' => fake()->randomElement(['pending', 'paid', 'paid', 'paid']), // More paid orders
                    'created_at' => fake()->dateTimeBetween('-3 months', 'now'),
                ]);

                if ($order->payment_status === 'paid') {
                    $order->markAsPaid('balance', 'BAL_' . time());
                }

                if ($order->status === 'completed') {
                    // Assign access codes and mark as delivered
                    $codes = $product->availableAccessCodes()->limit($quantity)->get();
                    foreach ($codes as $code) {
                        $code->markAsSold($order->id);
                    }
                    $order->update([
                        'access_codes_delivered' => $codes->pluck('id')->toArray(),
                        'completed_at' => fake()->dateTimeBetween($order->created_at, 'now'),
                    ]);
                    $product->updateStock();
                }

                // Create corresponding transaction
                Transaction::create([
                    'transaction_id' => Transaction::generateTransactionId(),
                    'user_id' => $customer->id,
                    'type' => 'purchase',
                    'amount' => -$order->total_amount,
                    'net_amount' => -$order->total_amount,
                    'status' => $order->payment_status === 'paid' ? 'completed' : 'pending',
                    'order_id' => $order->id,
                    'description' => "Purchase of {$product->name}",
                    'created_at' => $order->created_at,
                ]);
            }

            // Create some deposit transactions
            if (rand(1, 10) > 6) { // 40% chance
                $depositCount = rand(1, 3);
                for ($i = 0; $i < $depositCount; $i++) {
                    Transaction::create([
                        'transaction_id' => Transaction::generateTransactionId(),
                        'user_id' => $customer->id,
                        'type' => 'deposit',
                        'amount' => fake()->randomFloat(2, 50, 500),
                        'net_amount' => fake()->randomFloat(2, 50, 500),
                        'status' => 'completed',
                        'gateway' => 'nowpayments',
                        'description' => 'Account balance top-up',
                        'created_at' => fake()->dateTimeBetween('-2 months', 'now'),
                    ]);
                }
            }
        }
    }

    private function createSampleTickets(): void
    {
        $customers = User::role('customer')->limit(10)->get(); // Only some customers have tickets
        $supportAgent = User::role('support')->first() ?? User::role('admin')->first();

        $ticketSubjects = [
            'Issue with order delivery',
            'Account access problems',
            'Payment not processed',
            'Product not working as expected',
            'Request for refund',
            'Login credentials invalid',
            'Account verification help',
            'Bulk purchase inquiry',
            'Technical support needed',
            'Billing question',
        ];

        $ticketDescriptions = [
            'I purchased a product but haven\'t received the access codes yet. Can you please help?',
            'The login credentials provided don\'t seem to work. I\'ve tried multiple times.',
            'My payment was deducted but the order status still shows pending.',
            'The account I purchased appears to be already used or suspended.',
            'I would like to request a refund for my recent purchase as the product doesn\'t meet my needs.',
            'I\'m having trouble accessing my account dashboard after the recent update.',
            'Could you help me verify my account? I\'ve uploaded the required documents.',
            'I\'m interested in making a bulk purchase. Do you offer any discounts?',
            'I\'m experiencing technical difficulties with the product. Can you provide support?',
            'I have a question about the charges on my account statement.',
        ];

        foreach ($customers as $customer) {
            // Each customer has 0-3 tickets
            $ticketCount = rand(0, 3);

            for ($i = 0; $i < $ticketCount; $i++) {
                $subjectIndex = array_rand($ticketSubjects);
                $subject = $ticketSubjects[$subjectIndex];
                $description = $ticketDescriptions[$subjectIndex];

                $ticket = SupportTicket::create([
                    'ticket_number' => SupportTicket::generateTicketNumber(),
                    'user_id' => $customer->id,
                    'order_id' => $customer->orders()->inRandomOrder()->first()?->id,
                    'subject' => $subject,
                    'description' => $description,
                    'priority' => fake()->randomElement(['low', 'medium', 'medium', 'high']), // More medium priority
                    'status' => fake()->randomElement(['open', 'in_progress', 'waiting_response', 'resolved', 'closed']),
                    'assigned_to' => rand(1, 10) > 3 ? $supportAgent?->id : null, // 70% assigned
                    'created_at' => fake()->dateTimeBetween('-1 month', 'now'),
                ]);

                if ($ticket->status === 'resolved' || $ticket->status === 'closed') {
                    $ticket->update(['resolved_at' => fake()->dateTimeBetween($ticket->created_at, 'now')]);
                }

                // Add some messages to tickets
                $messageCount = rand(1, 5);
                $lastMessageTime = $ticket->created_at;

                for ($j = 0; $j < $messageCount; $j++) {
                    $isStaffReply = $j > 0 && rand(1, 10) > 4; // 60% chance for staff reply after first message
                    $userId = $isStaffReply ? $supportAgent?->id : $customer->id;

                    if ($userId) {
                        $messages = $isStaffReply ? [
                            'Thank you for contacting us. I\'m looking into your issue.',
                            'I\'ve checked your account and found the problem. Let me fix this for you.',
                            'The issue has been resolved. Please try again and let me know if you need further assistance.',
                            'I\'ve processed your request. You should see the changes within a few minutes.',
                            'Is there anything else I can help you with regarding this issue?',
                        ] : [
                            'Thank you for the quick response!',
                            'I\'m still experiencing the same problem.',
                            'That worked perfectly, thank you so much!',
                            'Could you please provide more details on how to proceed?',
                            'I appreciate your help with this matter.',
                        ];

                        TicketMessage::create([
                            'ticket_id' => $ticket->id,
                            'user_id' => $userId,
                            'message' => fake()->randomElement($messages),
                            'is_staff_reply' => $isStaffReply,
                            'created_at' => $lastMessageTime = fake()->dateTimeBetween($lastMessageTime, 'now'),
                        ]);
                    }
                }
            }
        }
    }
}
