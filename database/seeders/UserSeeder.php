<?php
// File: database/seeders/UserSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@waraccounts.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'balance' => 10000.00,
            'is_active' => true,
        ]);
        $admin->assignRole('admin');
        $admin->generateReferralCode();

        // Create support user
        $support = User::create([
            'name' => 'Support Agent',
            'email' => 'support@waraccounts.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'balance' => 1000.00,
            'is_active' => true,
        ]);
        $support->assignRole('support');
        $support->generateReferralCode();

        // Create test customer users
        $customers = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'balance' => 500.00,
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'balance' => 750.00,
            ],
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@example.com',
                'balance' => 250.00,
            ],
            [
                'name' => 'Sarah Wilson',
                'email' => 'sarah@example.com',
                'balance' => 1200.00,
            ],
            [
                'name' => 'David Brown',
                'email' => 'david@example.com',
                'balance' => 300.00,
            ],
        ];

        foreach ($customers as $customerData) {
            $customer = User::create([
                'name' => $customerData['name'],
                'email' => $customerData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'balance' => $customerData['balance'],
                'is_active' => true,
                'referred_by' => rand(1, 2) === 1 ? $admin->id : null, // Some referred by admin
            ]);
            $customer->assignRole('customer');
            $customer->generateReferralCode();
        }

        // Create additional random customers
        User::factory(20)->create()->each(function ($user) {
            $user->assignRole('customer');
            $user->generateReferralCode();
        });
    }
}
