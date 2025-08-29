<?php
// File: app/Notifications/LoginNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoginNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $ipAddress,
        private string $userAgent,
        private \DateTime $loginTime
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New login to your WarAccounts account')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We detected a new login to your WarAccounts account.')
            ->line('**Login Details:**')
            ->line('Time: ' . $this->loginTime->format('F j, Y \a\t g:i A T'))
            ->line('IP Address: ' . $this->ipAddress)
            ->line('Browser: ' . $this->userAgent)
            ->line('If this was you, no action is needed.')
            ->line('If you didn\'t sign in, please secure your account immediately.')
            ->action('Secure My Account', route('dashboard.profile.edit'))
            ->line('For your security, consider enabling two-factor authentication.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
            'login_time' => $this->loginTime->format('c'),
            'message' => 'New login detected.',
        ];
    }
}
