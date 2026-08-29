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
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        // 1. Run role seeder to initialize Spatie roles
        $this->call(RoleSeeder::class);

        // 2. Seed Default User Accounts
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Super Admin', 'password' => bcrypt('password')]
        );
        $admin->assignRole('Super Admin');

        $pm = User::firstOrCreate(
            ['email' => 'pm@example.com'],
            ['name' => 'Project Manager', 'password' => bcrypt('password')]
        );
        $pm->assignRole('Project Manager');

        $member = User::firstOrCreate(
            ['email' => 'member@example.com'],
            ['name' => 'Team Member', 'password' => bcrypt('password')]
        );
        $member->assignRole('Member');

        $viewer = User::firstOrCreate(
            ['email' => 'viewer@example.com'],
            ['name' => 'Viewer User', 'password' => bcrypt('password')]
        );
        $viewer->assignRole('Viewer');
    }
}