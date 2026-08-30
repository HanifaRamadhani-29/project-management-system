<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
<<<<<<< HEAD
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
=======
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83
use Tests\TestCase;

class ProjectManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed Spatie roles
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Project Manager']);
        Role::firstOrCreate(['name' => 'Member']);
    }

    /**
     * Test Super Admin can manage any project.
     */
<<<<<<< HEAD
    public function test_project_manager_can_access_user_list_for_selection(): void
    {
        $pm = User::factory()->create([
            'name' => 'PM User',
            'email' => 'pm-user@example.com',
            'role' => 'project_manager',
        ]);
        $pm->assignRole('Project Manager');

        $member = User::factory()->create([
            'name' => 'Member User',
            'email' => 'member-user@example.com',
            'role' => 'member',
        ]);
        $member->assignRole('Member');

        $response = $this->actingAs($pm)->get(route('users.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Users/Index')
            ->has('users.data', 2)
        );
    }

=======
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83
    public function test_super_admin_can_manage_any_project(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        $pm = User::factory()->create();
        $pm->assignRole('Project Manager');

        // Create project
        $response = $this->actingAs($admin)
            ->post(route('projects.store'), [
                'name' => 'Enterprise System Redesign',
                'status' => 'active',
                'description' => 'Test project',
                'start_date' => now()->format('Y-m-d'),
                'deadline' => now()->addDays(30)->format('Y-m-d'),
                'manager_id' => $pm->id,
            ]);

        $response->assertRedirect(route('projects.index'));
        $this->assertDatabaseHas('projects', ['name' => 'Enterprise System Redesign', 'manager_id' => $pm->id]);

        $project = Project::first();

        // Update project
        $response = $this->actingAs($admin)
            ->put(route('projects.update', $project->slug), [
                'name' => 'Updated System Name',
                'status' => 'completed',
                'description' => 'Updated description',
                'manager_id' => $pm->id,
            ]);

        $response->assertRedirect(route('projects.index'));
        $this->assertDatabaseHas('projects', ['name' => 'Updated System Name', 'status' => 'completed']);
    }

    /**
     * Test PM can only edit/delete projects they manage.
     */
    public function test_pm_can_only_manage_their_projects(): void
    {
        $pm1 = User::factory()->create();
        $pm1->assignRole('Project Manager');

        $pm2 = User::factory()->create();
        $pm2->assignRole('Project Manager');

        // Project managed by pm1
        $project1 = Project::factory()->create([
            'name' => 'PM1 Project',
            'manager_id' => $pm1->id,
        ]);

        // PM1 tries to update Project1 (should succeed)
        $response = $this->actingAs($pm1)
            ->put(route('projects.update', $project1->slug), [
                'name' => 'PM1 Project Updated',
                'status' => 'active',
                'manager_id' => $pm1->id,
            ]);
        $response->assertRedirect(route('projects.index'));
        $this->assertEquals('PM1 Project Updated', $project1->fresh()->name);

        // PM2 tries to update Project1 (should fail)
        $response = $this->actingAs($pm2)
            ->put(route('projects.update', $project1->fresh()->slug), [
                'name' => 'Hacked Name',
                'status' => 'active',
                'manager_id' => $pm2->id,
            ]);
        $response->assertStatus(403);
    }

    /**
     * Test PM can add/remove members from their project.
     */
    public function test_pm_can_manage_members_in_their_projects(): void
    {
        $pm = User::factory()->create();
        $pm->assignRole('Project Manager');

        $member = User::factory()->create();
        $member->assignRole('Member');

        $project = Project::factory()->create([
            'manager_id' => $pm->id,
        ]);

        // Add member
        $response = $this->actingAs($pm)
            ->post(route('projects.members.add', $project->slug), [
                'user_id' => $member->id,
            ]);
        
        $response->assertRedirect(route('projects.index'));
        $this->assertTrue($project->members->contains($member->id));

        // Remove member
        $response = $this->actingAs($pm)
            ->delete(route('projects.members.remove', [$project->slug, $member->id]));

        $response->assertRedirect(route('projects.index'));
        $this->assertFalse($project->fresh()->members->contains($member->id));
    }

    /**
     * Test progress calculation and overdue attribute.
     */
    public function test_project_calculates_progress_and_overdue_correctly(): void
    {
        $project = Project::factory()->create([
            'status' => 'active',
            'deadline' => now()->subDays(5)->format('Y-m-d'), // past deadline
        ]);

        $user = User::factory()->create();

        // Create tasks (2 total, 1 done)
        Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'done',
            'reporter_id' => $user->id,
        ]);
        Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'todo',
            'reporter_id' => $user->id,
        ]);

        $this->assertEquals(50, $project->progress);
        $this->assertTrue($project->is_overdue);
    }
}
