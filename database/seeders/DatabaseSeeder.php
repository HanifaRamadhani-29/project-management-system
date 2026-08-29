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
        // Run Spatie RoleSeeder first
        $this->call(RoleSeeder::class);

        // Create Super Admin User
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);
        $admin->assignRole('Super Admin');

        // Create Project Manager User
        $pm = User::create([
            'name' => 'Project Manager',
            'email' => 'pm@example.com',
            'password' => bcrypt('password'),
            'role' => 'project_manager',
        ]);
        $pm->assignRole('Project Manager');

        // Create Member User
        $member = User::create([
            'name' => 'Team Member',
            'email' => 'member@example.com',
            'password' => bcrypt('password'),
            'role' => 'member',
        ]);
        $member->assignRole('Member');
    }
}
