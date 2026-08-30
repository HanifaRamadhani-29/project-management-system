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

        $tasks = [
            [
                'title' => 'User login flow',
                'description' => 'Implement authentication and login screen for mobile users.',
                'status' => 'backlog',
                'priority' => 'high',
                'assignee_id' => $member->id,
                'reporter_id' => $pm->id,
                'deadline' => now()->addDays(3)->toDateString(),
                'order' => 0,
            ],
            [
                'title' => 'Dashboard widgets',
                'description' => 'Create summary cards and project overview for the mobile dashboard.',
                'status' => 'todo',
                'priority' => 'medium',
                'assignee_id' => $member->id,
                'reporter_id' => $pm->id,
                'deadline' => now()->addDays(6)->toDateString(),
                'order' => 0,
            ],
            [
                'title' => 'Task detail screen',
                'description' => 'Build task details and edit flow for project activity.',
                'status' => 'in_progress',
                'priority' => 'high',
                'assignee_id' => $member->id,
                'reporter_id' => $pm->id,
                'deadline' => now()->addDays(8)->toDateString(),
                'order' => 0,
            ],
            [
                'title' => 'QA review',
                'description' => 'Run regression and acceptance checks on the current release candidate.',
                'status' => 'review',
                'priority' => 'medium',
                'assignee_id' => $admin->id,
                'reporter_id' => $pm->id,
                'deadline' => now()->addDays(10)->toDateString(),
                'order' => 0,
            ],
            [
                'title' => 'Production release',
                'description' => 'Finalize release notes and signoff for the mobile app launch.',
                'status' => 'done',
                'priority' => 'low',
                'assignee_id' => $admin->id,
                'reporter_id' => $pm->id,
                'deadline' => now()->addDays(12)->toDateString(),
                'order' => 0,
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'title' => $taskData['title'],
                ],
                [
                    ...$taskData,
                    'project_id' => $project->id,
                ]
            );
        }
    }
}
