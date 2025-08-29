<?php
namespace App\Services;

use App\Models\User;
use Illuminate\Notifications\Notification;

class NotificationService
{
    /**
     * Send the given notification to the specified user.
     */
    public function send(User $user, Notification $notification): void
    {
        $user->notify($notification);
    }
}
