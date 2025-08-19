<?php
// File: app/Http/Controllers/Admin/UserManagementController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'transactions', 'orders'])
            ->withCount(['orders', 'transactions']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('referral_code', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $query->role($request->role);
        }

        // Status filter
        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $users = $query->paginate(15)->withQueryString();

        // Get stats for dashboard
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'kyc_verified_users' => User::where('kyc_verified', true)->count(),
            'users_with_balance' => User::where('balance', '>', 0)->count(),
            'total_balance' => User::sum('balance'),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'new_users_this_week' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ];

        $roles = Role::all();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'status', 'date_from', 'date_to', 'sort', 'direction']),
        ]);
    }

    public function show(User $user)
    {
        $user->load([
            'roles',
            'orders' => function ($query) {
                $query->with('product')->latest()->take(10);
            },
            'transactions' => function ($query) {
                $query->latest()->take(10);
            },
            'supportTickets' => function ($query) {
                $query->latest()->take(5);
            },
            'referrals' => function ($query) {
                $query->with('orders')->take(10);
            },
            'referredBy'
        ]);

        // User statistics
        $userStats = [
            'total_orders' => $user->orders()->count(),
            'completed_orders' => $user->orders()->where('status', 'completed')->count(),
            'total_spent' => $user->orders()->where('status', 'completed')->sum('net_amount'),
            'total_deposited' => $user->transactions()->where('type', 'deposit')->where('status', 'completed')->sum('amount'),
            'referral_earnings' => $user->referral_earnings,
            'referrals_count' => $user->referrals()->count(),
            'active_tickets' => $user->supportTickets()->whereIn('status', ['open', 'in_progress'])->count(),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'userStats' => $userStats,
        ]);
    }

    public function create()
    {
        $roles = Role::all();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|exists:roles,name',
            'balance' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'email_verified' => 'boolean',
            'kyc_verified' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'balance' => $request->balance ?? 0,
                'is_active' => $request->is_active ?? true,
                'kyc_verified' => $request->kyc_verified ?? false,
                'email_verified_at' => $request->email_verified ? now() : null,
            ]);

            // Assign role
            $user->assignRole($request->role);

            // Generate referral code if it's a customer
            if ($request->role === 'customer') {
                $user->generateReferralCode();
            }

            // Create initial balance transaction if balance > 0
            if ($request->balance > 0) {
                Transaction::create([
                    'transaction_id' => 'TXN_' . strtoupper(uniqid()),
                    'user_id' => $user->id,
                    'type' => 'deposit',
                    'amount' => $request->balance,
                    'net_amount' => $request->balance,
                    'status' => 'completed',
                    'description' => 'Initial balance set by admin',
                ]);
            }

            DB::commit();

            return redirect()->route('admin.users.index')
                ->with('success', 'User created successfully.');

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to create user: ' . $e->getMessage()
            ]);
        }
    }

    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::all();

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|exists:roles,name',
            'is_active' => 'boolean',
            'email_verified' => 'boolean',
            'kyc_verified' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'is_active' => $request->is_active ?? true,
                'kyc_verified' => $request->kyc_verified ?? false,
                'email_verified_at' => $request->email_verified ? now() : null,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);

            // Update role
            $user->syncRoles([$request->role]);

            DB::commit();

            return redirect()->route('admin.users.show', $user)
                ->with('success', 'User updated successfully.');

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to update user: ' . $e->getMessage()
            ]);
        }
    }

    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user->update([
            'is_active' => false,
            'last_login_at' => null,
        ]);

        // Log the suspension
        activity()
            ->performedOn($user)
            ->causedBy(auth()->user())
            ->withProperties([
                'reason' => $request->reason,
                'action' => 'suspended'
            ])
            ->log('User account suspended');

        return back()->with('success', 'User suspended successfully.');
    }

    public function activate(User $user)
    {
        $user->update([
            'is_active' => true,
        ]);

        // Log the activation
        activity()
            ->performedOn($user)
            ->causedBy(auth()->user())
            ->withProperties(['action' => 'activated'])
            ->log('User account activated');

        return back()->with('success', 'User activated successfully.');
    }

    public function addBalance(Request $request, User $user)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'type' => 'required|in:deposit,refund,referral_commission',
        ]);

        DB::beginTransaction();

        try {
            // Add balance to user
            $user->increment('balance', $request->amount);

            // Create transaction record
            Transaction::create([
                'transaction_id' => 'TXN_' . strtoupper(uniqid()),
                'user_id' => $user->id,
                'type' => $request->type,
                'amount' => $request->amount,
                'net_amount' => $request->amount,
                'status' => 'completed',
                'description' => $request->description,
            ]);

            // Log the action
            activity()
                ->performedOn($user)
                ->causedBy(auth()->user())
                ->withProperties([
                    'amount' => $request->amount,
                    'type' => $request->type,
                    'description' => $request->description
                ])
                ->log('Balance added by admin');

            DB::commit();

            return back()->with('success', 'Balance added successfully.');

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors([
                'error' => 'Failed to add balance: ' . $e->getMessage()
            ]);
        }
    }

    public function destroy(User $user)
    {
        // Prevent deletion of users with orders or transactions
        if ($user->orders()->exists() || $user->transactions()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete user with existing orders or transactions. Consider suspending instead.'
            ]);
        }

        // Prevent deletion of admin users
        if ($user->hasRole('admin')) {
            return back()->withErrors([
                'error' => 'Cannot delete admin users.'
            ]);
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
