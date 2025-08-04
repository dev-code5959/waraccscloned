<?php
// File: database/seeders/RoleAndPermissionSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User management
            'view users',
            'create users',
            'edit users',
            'delete users',
            'suspend users',

            // Product management
            'view products',
            'create products',
            'edit products',
            'delete products',
            'manage stock',

            // Category management
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',

            // Order management
            'view orders',
            'edit orders',
            'process orders',
            'cancel orders',
            'refund orders',

            // Transaction management
            'view transactions',
            'create transactions',
            'edit transactions',
            'approve transactions',

            // Support management
            'view tickets',
            'create tickets',
            'edit tickets',
            'assign tickets',
            'close tickets',

            // Promo code management
            'view promo codes',
            'create promo codes',
            'edit promo codes',
            'delete promo codes',

            // CMS management
            'view cms pages',
            'create cms pages',
            'edit cms pages',
            'delete cms pages',

            // Reports and analytics
            'view reports',
            'view analytics',
            'export data',

            // System settings
            'manage settings',
            'manage roles',
            'manage permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $customerRole = Role::create(['name' => 'customer']);
        $supportRole = Role::create(['name' => 'support']);

        // Assign permissions to admin role (all permissions)
        $adminRole->givePermissionTo(Permission::all());

        // Assign permissions to support role
        $supportRole->givePermissionTo([
            'view users',
            'view orders',
            'edit orders',
            'process orders',
            'view transactions',
            'view tickets',
            'create tickets',
            'edit tickets',
            'assign tickets',
            'close tickets',
            'view products',
            'view categories',
        ]);

        // Customer role has no special permissions (default user actions)
        // Customer permissions are handled by policies and middleware
    }
}
