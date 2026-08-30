<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
                // 2. Seed Default User Accounts
        $admin = User::create([
            'name' => 'Super Admin',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);
        $admin->assignRole('Super Admin');

        $pm = User::create([
            'name' => 'Project Manager',
            'username' => 'pm',
            'email' => 'pm@example.com',
            'password' => bcrypt('password'),
            'role' => 'project_manager',
        ]);
        $pm->assignRole('Project Manager');

        $member = User::create([
            'name' => 'Team Member',
            'username' => 'member',
            'email' => 'member@example.com',
            'password' => bcrypt('password'),
            'role' => 'member',
        ]);
        $member->assignRole('Member');

        $viewer = User::create([
            'name' => 'Viewer User',
            'username' => 'viewer',
            'email' => 'viewer@example.com',
            'password' => bcrypt('password'),
            'role' => 'viewer',
        ]);
        $viewer->assignRole('Viewer');
    }
}
