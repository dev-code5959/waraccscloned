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
        return ['mail'];
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
}

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
        return ['mail'];
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
}

// File: app/Notifications/PasswordResetNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $token
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject('Reset Password - WarAccounts')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in ' . config('auth.passwords.' . config('auth.defaults.passwords') . '.expire') . ' minutes.')
            ->line('If you did not request a password reset, no further action is required.')
            ->line('For security reasons, please do not share this link with anyone.');
    }
}

// File: app/Notifications/EmailVerificationNotification.php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class EmailVerificationNotification extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Email Address - WarAccounts')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Thank you for creating an WarAccounts account.')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email Address', $verificationUrl)
            ->line('This verification link will expire in 60 minutes.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Best regards, The WarAccounts Team');
    }
}

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
        return ['mail'];
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
}
