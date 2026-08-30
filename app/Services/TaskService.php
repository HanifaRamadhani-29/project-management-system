<?php

namespace App\Services;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TaskService
{
    /**
     * Create a new task.
     */
    public function createTask(Project $project, array $data, User $user): Task
    {
        return DB::transaction(function () use ($project, $data, $user) {
            $data['project_id'] = $project->id;
            $data['reporter_id'] = $user->id;
            
            // Set default status if not provided
            if (empty($data['status'])) {
                $data['status'] = 'backlog';
            }

            // Determine the order (append to the bottom of the status column)
            $maxOrder = Task::where('project_id', $project->id)
                ->where('status', $data['status'])
                ->max('order');
            
            $data['order'] = $maxOrder !== null ? $maxOrder + 1 : 0;

            return Task::create($data);
        });
    }

    /**
     * Update an existing task.
     */
    public function updateTask(Task $task, array $data): Task
    {
        return DB::transaction(function () use ($task, $data) {
            // Check if status changed
            if (isset($data['status']) && $data['status'] !== $task->status) {
                // Determine new order for the new status column
                $maxOrder = Task::where('project_id', $task->project_id)
                    ->where('status', $data['status'])
                    ->max('order');
                
                $data['order'] = $maxOrder !== null ? $maxOrder + 1 : 0;
            }

            $task->update($data);
            return $task;
        });
    }

    /**
     * Delete a task.
     */
    public function deleteTask(Task $task): bool
    {
        return DB::transaction(function () use ($task) {
            return $task->delete();
        });
    }
}
