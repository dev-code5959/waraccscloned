<?php
namespace App\Listeners;

use App\Notifications\WelcomeNotification;
use App\Services\NotificationService;
use Illuminate\Auth\Events\Registered;

class SendWelcomeNotification
{
    public function __construct(private NotificationService $notifications)
    {
    }

    public function handle(Registered $event): void
    {
        $this->notifications->send($event->user, new WelcomeNotification($event->user));
    }
}
