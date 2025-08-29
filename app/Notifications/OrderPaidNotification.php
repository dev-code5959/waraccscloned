<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPaidNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Payment Received - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We have received your payment for order ' . $this->order->order_number . '.')
            ->line('Total Paid: ' . $this->order->formatted_net_amount);

        if ($this->order->status === 'pending_delivery') {
            $mail->line('Your order is now being processed and will be delivered shortly.');
        }

        return $mail
            ->action('View Order', route('dashboard.orders.show', $this->order))
            ->line('Thank you for shopping with us!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'paid',
            'message' => 'Payment received.',
        ];
    }
}
