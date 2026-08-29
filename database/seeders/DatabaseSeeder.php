<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Run Permission Seeder to initialize Spatie roles and permissions
        $this->call(PermissionSeeder::class);

        // 2. Seed Default User Accounts
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);
        $admin->assignRole('Super Admin');

        $pm = User::create([
            'name' => 'Project Manager',
            'email' => 'pm@example.com',
            'password' => bcrypt('password'),
            'role' => 'project_manager',
        ]);
        $pm->assignRole('Project Manager');

        $member = User::create([
            'name' => 'Team Member',
            'email' => 'member@example.com',
            'password' => bcrypt('password'),
            'role' => 'member',
        ]);
        $member->assignRole('Member');

        $viewer = User::create([
            'name' => 'Viewer User',
            'email' => 'viewer@example.com',
            'password' => bcrypt('password'),
            'role' => 'viewer',
        ]);
        $viewer->assignRole('Viewer');
    }
}
