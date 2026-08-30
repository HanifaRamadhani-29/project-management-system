<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskApproval;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TaskApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $pm;
    protected User $member;
    protected Project $project;
    protected Task $task;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => 'PermissionSeeder']);

        // Create users
        $this->admin = User::factory()->create(['role' => 'super_admin']);
        $this->admin->assignRole('Super Admin');

        $this->pm = User::factory()->create(['role' => 'project_manager']);
        $this->pm->assignRole('Project Manager');

        $this->member = User::factory()->create(['role' => 'member']);
        $this->member->assignRole('Member');

        // Create project and assign PM as manager
        $this->project = Project::factory()->create([
            'manager_id' => $this->pm->id,
        ]);

        // Add member to project
        $this->project->members()->attach($this->member->id, ['role' => 'member']);

        // Create task under the project
        $this->task = Task::create([
            'project_id' => $this->project->id,
            'title' => 'Implement Auth State Machine',
            'status' => 'in_progress',
            'priority' => 'high',
            'reporter_id' => $this->pm->id,
            'assignee_id' => $this->member->id,
        ]);
    }

    public function test_member_can_submit_task_for_review(): void
    {
        $response = $this->actingAs($this->member)
            ->post(route('tasks.submit-review', $this->task->id), [
                'note' => 'I have completed the core logic, please review.',
            ]);

        $response->assertRedirect();
        
        // Assert task status changed
        $this->assertEquals('review', $this->task->fresh()->status);

        // Assert approval record created
        $this->assertDatabaseHas('task_approvals', [
            'task_id' => $this->task->id,
            'status' => 'Pending',
            'requested_by' => $this->member->id,
            'note' => 'I have completed the core logic, please review.',
        ]);
    }

    public function test_project_manager_can_approve_task(): void
    {
        // First submit for review
        $this->actingAs($this->member)
            ->post(route('tasks.submit-review', $this->task->id), [
                'note' => 'Please approve',
            ]);

        // PM approves
        $response = $this->actingAs($this->pm)
            ->post(route('tasks.approve', $this->task->id));

        $response->assertRedirect();

        // Assert status changed to done
        $this->assertEquals('done', $this->task->fresh()->status);

        // Assert approval record updated
        $this->assertDatabaseHas('task_approvals', [
            'task_id' => $this->task->id,
            'status' => 'Approved',
            'reviewed_by' => $this->pm->id,
        ]);
    }

    public function test_project_manager_can_request_revision(): void
    {
        // First submit for review
        $this->actingAs($this->member)
            ->post(route('tasks.submit-review', $this->task->id), [
                'note' => 'Please approve',
            ]);

        // PM requests revision
        $response = $this->actingAs($this->pm)
            ->post(route('tasks.revision', $this->task->id), [
                'feedback' => 'Missing unit tests, please add them.',
            ]);

        $response->assertRedirect();

        // Assert status went back to in_progress
        $this->assertEquals('in_progress', $this->task->fresh()->status);

        // Assert approval record updated
        $this->assertDatabaseHas('task_approvals', [
            'task_id' => $this->task->id,
            'status' => 'Revision Required',
            'feedback' => 'Missing unit tests, please add them.',
            'reviewed_by' => $this->pm->id,
        ]);
    }

    public function test_unauthorized_user_cannot_approve_task(): void
    {
        // Another project member
        $otherUser = User::factory()->create(['role' => 'member']);
        $otherUser->assignRole('Member');

        // Submit for review
        $this->actingAs($this->member)
            ->post(route('tasks.submit-review', $this->task->id));

        // Other user attempts to approve
        $response = $this->actingAs($otherUser)
            ->post(route('tasks.approve', $this->task->id));

        $response->assertStatus(403);
    }

    public function test_member_cannot_drag_task_to_done(): void
    {
        $response = $this->actingAs($this->member)
            ->patch(route('tasks.reorder', $this->project->slug), [
                'status' => 'done',
                'ordered_ids' => [$this->task->id],
            ]);

        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
        ]);
        $this->assertStringContainsString('Akses Ditolak', $response->json('message'));
    }

    public function test_pm_can_drag_task_to_done(): void
    {
        $response = $this->actingAs($this->pm)
            ->patch(route('tasks.reorder', $this->project->slug), [
                'status' => 'done',
                'ordered_ids' => [$this->task->id],
            ]);

        $response->assertStatus(200);
        $this->assertEquals('done', $this->task->fresh()->status);
    }

    public function test_drag_to_review_auto_creates_approval(): void
    {
        $response = $this->actingAs($this->member)
            ->patch(route('tasks.reorder', $this->project->slug), [
                'status' => 'review',
                'ordered_ids' => [$this->task->id],
            ]);

        $response->assertStatus(200);
        $this->assertEquals('review', $this->task->fresh()->status);

        $this->assertDatabaseHas('task_approvals', [
            'task_id' => $this->task->id,
            'status' => 'Pending',
            'requested_by' => $this->member->id,
            'note' => 'Diajukan otomatis melalui pemindahan kartu ke Under Review',
        ]);
    }
}
