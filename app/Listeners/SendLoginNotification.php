<?php
namespace App\Listeners;

use App\Notifications\LoginNotification;
use App\Services\NotificationService;
use Illuminate\Auth\Events\Login;

class SendLoginNotification
{
    public function __construct(private NotificationService $notifications)
    {
    }

    public function handle(Login $event): void
    {
        $ip = request()->ip();
        $agent = request()->header('User-Agent', 'unknown');
        $this->notifications->send($event->user, new LoginNotification($ip, $agent, now()));
    }
}
