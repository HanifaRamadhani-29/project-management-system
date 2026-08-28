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
        // Seed roles
        $this->call(RoleSeeder::class);

        // Seed Super Admin
        $admin = User::factory()->create([
            'name' => 'Admin Hanifa',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('Super Admin');

        // Seed Project Manager
        $pm = User::factory()->create([
            'name' => 'Project Manager PM',
            'email' => 'pm@example.com',
        ]);
        $pm->assignRole('Project Manager');

        // Seed Member
        $member = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        $member->assignRole('Member');

        // Create projects
        $project1 = \App\Models\Project::factory()->create([
            'name' => 'Enterprise System Redesign',
            'slug' => 'enterprise-system-redesign',
            'status' => 'active',
            'description' => 'A major project to modernize and redesign the enterprise core administration system.',
            'manager_id' => $pm->id,
        ]);

        $project2 = \App\Models\Project::factory()->create([
            'name' => 'Mobile App Integration',
            'slug' => 'mobile-app-integration',
            'status' => 'planning',
            'description' => 'Developing mobile companions for our core enterprise resources.',
            'manager_id' => $pm->id,
        ]);

        // Seed tasks for project1 with different statuses and order priorities
        \App\Models\Task::factory()->create([
            'project_id' => $project1->id,
            'title' => 'Define API schema for dashboard',
            'status' => 'backlog',
            'priority' => 'critical',
            'reporter_id' => $admin->id,
            'assignee_id' => $member->id,
            'order' => 1,
            'deadline' => now()->addDays(5)->format('Y-m-d'),
        ]);

        \App\Models\Task::factory()->create([
            'project_id' => $project1->id,
            'title' => 'Integrate Spatie Permissions',
            'status' => 'todo',
            'priority' => 'high',
            'reporter_id' => $admin->id,
            'assignee_id' => $member->id,
            'order' => 1,
            'deadline' => now()->addDays(10)->format('Y-m-d'),
        ]);

        \App\Models\Task::factory()->create([
            'project_id' => $project1->id,
            'title' => 'Create Kanban board layout',
            'status' => 'in_progress',
            'priority' => 'high',
            'reporter_id' => $admin->id,
            'assignee_id' => $member->id,
            'order' => 1,
            'deadline' => now()->subDays(2)->format('Y-m-d'), // overdue task
        ]);

        \App\Models\Task::factory()->create([
            'project_id' => $project1->id,
            'title' => 'Write unit tests for task reordering',
            'status' => 'review',
            'priority' => 'medium',
            'reporter_id' => $pm->id,
            'assignee_id' => null,
            'order' => 1,
            'deadline' => now()->addDays(3)->format('Y-m-d'),
        ]);

        \App\Models\Task::factory()->create([
            'project_id' => $project1->id,
            'title' => 'Setup development server environment',
            'status' => 'done',
            'priority' => 'low',
            'reporter_id' => $pm->id,
            'assignee_id' => $member->id,
            'order' => 1,
            'deadline' => now()->subDays(5)->format('Y-m-d'),
        ]);
    }
}
