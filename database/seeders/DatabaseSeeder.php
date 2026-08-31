<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Run PermissionSeeder
        $this->call([
            PermissionSeeder::class,
        ]);

        // 2. Create Super Admin (with username and Spatie Role)
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('Super Admin');

        // 3. Create Project Manager (with username and Spatie Role)
        $pm = User::firstOrCreate(
            ['email' => 'pm@example.com'],
            [
                'name' => 'Project Manager',
                'username' => 'pm_lead',
                'password' => Hash::make('password'),
                'role' => 'project_manager',
                'email_verified_at' => now(),
            ]
        );
        $pm->assignRole('Project Manager');

        // 4. Create Team Member (with username and Spatie Role)
        $member = User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'Team Member',
                'username' => 'member_dev',
                'password' => Hash::make('password'),
                'role' => 'member',
                'email_verified_at' => now(),
            ]
        );
        $member->assignRole('Member');

        // 5. Create Viewer / Client (with username and Spatie Role)
        $viewer = User::firstOrCreate(
            ['email' => 'viewer@example.com'],
            [
                'name' => 'Viewer Client',
                'username' => 'viewer_client',
                'password' => Hash::make('password'),
                'role' => 'viewer',
                'email_verified_at' => now(),
            ]
        );
        $viewer->assignRole('Viewer');

        // 6. Seed default labels
        $labels = [
            ['name' => 'Bug', 'slug' => 'bug', 'color' => '#ef4444'],
            ['name' => 'Feature', 'slug' => 'feature', 'color' => '#3b82f6'],
            ['name' => 'Enhancement', 'slug' => 'enhancement', 'color' => '#10b981'],
            ['name' => 'Documentation', 'slug' => 'documentation', 'color' => '#f59e0b'],
            ['name' => 'Urgent', 'slug' => 'urgent', 'color' => '#8b5cf6'],
        ];

        foreach ($labels as $label) {
            \App\Models\Label::firstOrCreate(['slug' => $label['slug']], $label);
        }
    }
}
