<?php
// File: app/Notifications/WelcomeNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private User $user
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to WarAccounts!')
            ->greeting('Welcome to WarAccounts, ' . $this->user->name . '!')
            ->line('Your account has been successfully created.')
            ->line('You can now browse our digital products and make purchases.')
            ->line('Here are some things you can do:')
            ->line('• Browse our product catalog')
            ->line('• Add funds to your account')
            ->line('• Set up two-factor authentication for extra security')
            ->line('• Refer friends and earn commissions')
            ->action('Start Shopping', url('/'))
            ->line('If you have any questions, don\'t hesitate to contact our support team.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Welcome to WarAccounts!',
        ];
    }
}
