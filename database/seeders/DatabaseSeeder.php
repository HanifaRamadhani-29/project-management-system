<?php

namespace Database\Seeders;

use App\Models\Label;
use App\Models\Project;
use App\Models\Task;
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

        // 2. Seed Default Labels
        $defaultLabels = [
            ['name' => 'Bug', 'slug' => 'bug', 'color' => '#EF4444'],
            ['name' => 'Feature', 'slug' => 'feature', 'color' => '#3B82F6'],
            ['name' => 'Improvement', 'slug' => 'improvement', 'color' => '#8B5CF6'],
            ['name' => 'Urgent', 'slug' => 'urgent', 'color' => '#F97316'],
            ['name' => 'Documentation', 'slug' => 'documentation', 'color' => '#06B6D4'],
            ['name' => 'Design', 'slug' => 'design', 'color' => '#EC4899'],
        ];

        foreach ($defaultLabels as $label) {
            Label::firstOrCreate(['slug' => $label['slug']], $label);
        }

        // 3. Seed Default User Accounts
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'role' => 'super_admin',
            ]
        );
        $admin->assignRole('Super Admin');

        $pm = User::firstOrCreate(
            ['email' => 'pm@example.com'],
            [
                'name' => 'Project Manager',
                'password' => bcrypt('password'),
                'role' => 'project_manager',
            ]
        );
        $pm->assignRole('Project Manager');

        $member = User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'Team Member',
                'password' => bcrypt('password'),
                'role' => 'member',
            ]
        );
        $member->assignRole('Member');

        $viewer = User::firstOrCreate(
            ['email' => 'viewer@example.com'],
            [
                'name' => 'Viewer User',
                'password' => bcrypt('password'),
                'role' => 'viewer',
            ]
        );
        $viewer->assignRole('Viewer');

        $project = Project::firstOrCreate(
            ['slug' => 'mobile'],
            [
                'name' => 'mobile',
                'description' => 'mobile application',
                'status' => 'planning',
                'start_date' => now()->toDateString(),
                'deadline' => now()->addMonths(2)->toDateString(),
                'manager_id' => $pm->id,
            ]
        );

        $project->members()->syncWithoutDetaching([
            $admin->id => ['role' => 'owner'],
            $pm->id => ['role' => 'manager'],
            $member->id => ['role' => 'member'],
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
