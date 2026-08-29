<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $member;

    protected function setUp(): void
    {
        parent::setUp();

        // Register observer routes & clean db state
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Member']);

        $this->admin = User::factory()->create([
            'role' => 'super_admin',
        ]);
        $this->admin->assignRole('Super Admin');

        $this->member = User::factory()->create([
            'role' => 'member',
        ]);
        $this->member->assignRole('Member');
    }

    /**
     * Test non-admin gets 403 on audit logs.
     */
    public function test_non_admin_cannot_access_audit_logs(): void
    {
        $response = $this->actingAs($this->member)->get(route('audit_logs.index'));
        $response->assertStatus(403);
    }

    /**
     * Test admin can access audit logs.
     */
    public function test_admin_can_access_audit_logs(): void
    {
        $response = $this->actingAs($this->admin)->get(route('audit_logs.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('AuditLogs/Index')
            ->has('auditLogs')
            ->has('actionOptions')
            ->has('userOptions')
        );
    }

    /**
     * Test Project creation logs correctly.
     */
    public function test_project_creation_triggers_observer_logging(): void
    {
        $this->assertEquals(0, AuditLog::count());

        // Create a project acting as admin
        $project = $this->actingAs($this->admin)->createProject([
            'name' => 'Enterprise System',
            'status' => 'active',
            'deadline' => now()->addDays(10)->toDateString(),
        ]);

        $this->assertEquals(1, AuditLog::count());

        $log = AuditLog::first();
        $this->assertEquals('PROJECT_CREATED', $log->action);
        $this->assertEquals(Project::class, $log->auditable_type);
        $this->assertEquals($project->id, $log->auditable_id);
        $this->assertNull($log->old_values);
        $this->assertEquals('active', $log->new_values['status']);
    }

    /**
     * Test Project mutation logs correctly.
     */
    public function test_project_update_and_deletion_trigger_observer_logging(): void
    {
        $project = $this->actingAs($this->admin)->createProject([
            'name' => 'Enterprise System',
            'status' => 'active',
        ]);

        // Reset log count (creation produces 1 log)
        AuditLog::query()->delete();

        // Update project status
        $project->update(['status' => 'completed']);

        $this->assertEquals(1, AuditLog::count());
        $log = AuditLog::first();
        $this->assertEquals('PROJECT_UPDATED', $log->action);
        $this->assertEquals('active', $log->old_values['status']);
        $this->assertEquals('completed', $log->new_values['status']);

        // Delete project
        AuditLog::query()->delete();
        $project->delete();

        $this->assertEquals(1, AuditLog::count());
        $log = AuditLog::first();
        $this->assertEquals('PROJECT_DELETED', $log->action);
        $this->assertNull($log->new_values);
    }

    /**
     * Test Task mutations trigger observer logging.
     */
    public function test_task_mutations_trigger_observer_logging(): void
    {
        $project = $this->actingAs($this->admin)->createProject([
            'name' => 'Enterprise System',
            'status' => 'active',
        ]);

        // Creating task
        AuditLog::query()->delete();
        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Task Title',
            'status' => 'todo',
            'priority' => 'medium',
            'reporter_id' => $this->admin->id,
            'deadline' => now()->toDateString(),
        ]);

        $this->assertEquals(1, AuditLog::count());
        $this->assertEquals('TASK_CREATED', AuditLog::first()->action);

        // Status change
        AuditLog::query()->delete();
        $task->update(['status' => 'in_progress']);

        $this->assertEquals(1, AuditLog::count());
        $log = AuditLog::first();
        $this->assertEquals('TASK_STATUS_CHANGED', $log->action);
        $this->assertEquals('todo', $log->old_values['status']);
        $this->assertEquals('in_progress', $log->new_values['status']);

        // Deadline change
        AuditLog::query()->delete();
        $task->update(['deadline' => now()->addDays(5)->toDateString()]);

        $this->assertEquals(1, AuditLog::count());
        $this->assertEquals('TASK_DEADLINE_CHANGED', AuditLog::first()->action);

        // Deletion
        AuditLog::query()->delete();
        $task->delete();

        $this->assertEquals(1, AuditLog::count());
        $this->assertEquals('TASK_DELETED', AuditLog::first()->action);
    }

    /**
     * Helper method to create a project acting as a user.
     */
    private function createProject(array $attributes): Project
    {
        return Project::create(array_merge([
            'name' => 'Test Project',
            'slug' => 'test-project-' . rand(1, 1000),
            'status' => 'active',
            'description' => 'Test Description',
            'manager_id' => $this->admin->id,
            'start_date' => now()->toDateString(),
            'deadline' => now()->addDays(5)->toDateString(),
        ], $attributes));
    }
}
