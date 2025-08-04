<?php
// File: database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            // ProductSeeder::class,
            // AccessCodeSeeder::class,
            // PromoCodeSeeder::class,
            // CmsPageSeeder::class,
            SampleDataSeeder::class,
        ]);
    }
}
