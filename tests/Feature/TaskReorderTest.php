<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskReorderTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test guest cannot reorder tasks.
     */
    public function test_guest_cannot_reorder_tasks(): void
    {
        $project = Project::factory()->create();
        $task = Task::factory()->create(['project_id' => $project->id]);

        $response = $this->patchJson(route('tasks.reorder', $project), [
            'status' => 'todo',
            'ordered_ids' => [$task->id],
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test authorized user can reorder tasks within the same status column.
     */
    public function test_user_can_reorder_tasks_in_same_column(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();
        
        $task1 = Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'todo',
            'order' => 1,
            'reporter_id' => $user->id,
        ]);
        $task2 = Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'todo',
            'order' => 2,
            'reporter_id' => $user->id,
        ]);

        // Reorder: swap positions
        $response = $this->actingAs($user)
            ->patchJson(route('tasks.reorder', $project), [
                'status' => 'todo',
                'ordered_ids' => [$task2->id, $task1->id],
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertEquals(1, $task2->fresh()->order);
        $this->assertEquals(2, $task1->fresh()->order);
        $this->assertEquals('todo', $task1->fresh()->status);
        $this->assertEquals('todo', $task2->fresh()->status);
    }

    /**
     * Test authorized user can move task to another column and update orders.
     */
    public function test_user_can_move_task_to_another_column(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();

        $task1 = Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'todo',
            'order' => 1,
            'reporter_id' => $user->id,
        ]);
        $task2 = Task::factory()->create([
            'project_id' => $project->id,
            'status' => 'in_progress',
            'order' => 1,
            'reporter_id' => $user->id,
        ]);

        // Move task1 to in_progress and make it the first item, task2 the second
        $response = $this->actingAs($user)
            ->patchJson(route('tasks.reorder', $project), [
                'status' => 'in_progress',
                'ordered_ids' => [$task1->id, $task2->id],
            ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertEquals('in_progress', $task1->fresh()->status);
        $this->assertEquals(1, $task1->fresh()->order);
        
        $this->assertEquals('in_progress', $task2->fresh()->status);
        $this->assertEquals(2, $task2->fresh()->order);
    }

    /**
     * Test validation schema.
     */
    public function test_validation_fails_for_invalid_status_or_missing_ids(): void
    {
        $user = User::factory()->create();
        $project = Project::factory()->create();

        // Invalid status
        $response = $this->actingAs($user)
            ->patchJson(route('tasks.reorder', $project), [
                'status' => 'invalid_status_name',
                'ordered_ids' => [1],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['status']);

        // Missing ordered_ids
        $response = $this->actingAs($user)
            ->patchJson(route('tasks.reorder', $project), [
                'status' => 'todo',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['ordered_ids']);
    }
}
