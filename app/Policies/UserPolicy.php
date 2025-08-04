<?php
// File: app/Policies/UserPolicy.php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->hasRole('admin') && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can suspend the model.
     */
    public function suspend(User $user, User $model): bool
    {
        return $user->hasRole('admin') && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can manage balance for the model.
     */
    public function manageBalance(User $user, User $model): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can view transactions for the model.
     */
    public function viewTransactions(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can view orders for the model.
     */
    public function viewOrders(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can assign roles to the model.
     */
    public function assignRoles(User $user, User $model): bool
    {
        return $user->hasRole('admin') && $user->id !== $model->id;
    }
}

// File: app/Policies/OrderPolicy.php

namespace App\Policies;

use App\Models\User;
use App\Models\Order;

class OrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'support', 'customer']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('customer') && $user->is_active && $user->hasVerifiedEmail();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Order $order): bool
    {
        return $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can cancel the model.
     */
    public function cancel(User $user, Order $order): bool
    {
        return ($user->id === $order->user_id && $order->can_be_cancelled) ||
            $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can process the model.
     */
    public function process(User $user, Order $order): bool
    {
        return $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can refund the model.
     */
    public function refund(User $user, Order $order): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can download credentials.
     */
    public function downloadCredentials(User $user, Order $order): bool
    {
        return $user->id === $order->user_id && $order->is_completed;
    }
}

// File: app/Policies/SupportTicketPolicy.php

namespace App\Policies;

use App\Models\User;
use App\Models\SupportTicket;

class SupportTicketPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view their own tickets
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SupportTicket $ticket): bool
    {
        return $user->id === $ticket->user_id || $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SupportTicket $ticket): bool
    {
        return $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can reply to the model.
     */
    public function reply(User $user, SupportTicket $ticket): bool
    {
        return $user->id === $ticket->user_id || $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can assign the model.
     */
    public function assign(User $user, SupportTicket $ticket): bool
    {
        return $user->hasRole(['admin', 'support']);
    }

    /**
     * Determine whether the user can close the model.
     */
    public function close(User $user, SupportTicket $ticket): bool
    {
        return $user->id === $ticket->user_id || $user->hasRole(['admin', 'support']);
    }
}
