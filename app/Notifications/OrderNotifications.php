<?php
namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Placed - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your order has been placed successfully.')
            ->line('Order Number: ' . $this->order->order_number)
            ->line('Product: ' . $this->order->product->name)
            ->line('Quantity: ' . $this->order->quantity)
            ->line('Total: ' . $this->order->formatted_total)
            ->action('View Order', route('dashboard.orders.show', $this->order))
            ->line('Thank you for shopping with us!');
    }
}

class OrderPaidNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
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
}

class OrderDeliveredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Delivered - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your order ' . $this->order->order_number . ' has been delivered.')
            ->action('View Order', route('dashboard.orders.show', $this->order))
            ->line('Thank you for shopping with us!');
    }
}

class OrderCancelledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Order $order)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Cancelled - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your order ' . $this->order->order_number . ' has been cancelled.')
            ->action('View Orders', route('dashboard.orders.index'))
            ->line('If you have any questions, please contact support.');
    }
}
