<?php

// File: app/Notifications/AccountSuspendedNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountSuspendedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $reason
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Account Suspended - WarAccounts')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your WarAccounts account has been suspended.')
            ->line('**Reason:** ' . $this->reason)
            ->line('If you believe this is a mistake or would like to appeal this decision, please contact our support team.')
            ->action('Contact Support', url('/contact'))
            ->line('Thank you for your understanding.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'reason' => $this->reason,
            'message' => 'Account suspended.',
        ];
    }
}
