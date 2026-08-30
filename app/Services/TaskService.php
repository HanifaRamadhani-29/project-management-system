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

            if (empty($data['status'])) {
                $data['status'] = 'backlog';
            }

            if (empty($data['priority'])) {
                $data['priority'] = 'medium';
            }

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
            // FR-DEP-02: Block status change to "done" if dependencies are not done
            if (isset($data['status']) && $data['status'] === 'done') {
                $unfinishedDeps = $task->dependencies()
                    ->where('status', '!=', 'done')
                    ->get();

                if ($unfinishedDeps->isNotEmpty()) {
                    $names = $unfinishedDeps->pluck('title')->join(', ');
                    throw new \InvalidArgumentException(
                        "Task tidak dapat diselesaikan karena masih terdapat dependency yang belum selesai: {$names}"
                    );
                }
            }

            if (isset($data['status']) && $data['status'] !== $task->status) {
                $maxOrder = Task::where('project_id', $task->project_id)
                    ->where('status', $data['status'])
                    ->max('order');

                $data['order'] = $maxOrder !== null ? $maxOrder + 1 : 0;
            }

            if (isset($data['parent_id']) && $data['parent_id'] !== null) {
                $parentTask = Task::findOrFail($data['parent_id']);

                if ($parentTask->project_id !== $task->project_id) {
                    throw new \InvalidArgumentException('Subtask harus berada dalam project yang sama.');
                }
            }

            $task->update($data);

            return $task->fresh();
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

    /**
     * Create a subtask for a parent task.
     */
    public function createSubtask(Project $project, Task $parentTask, array $data, User $user): Task
    {
        if ($parentTask->project_id !== $project->id) {
            throw new \InvalidArgumentException('Subtask harus dibuat pada task yang ada di project yang sama.');
        }

        $data['project_id'] = $project->id;
        $data['reporter_id'] = $user->id;
        $data['parent_id'] = $parentTask->id;
        $data['status'] = $data['status'] ?? 'backlog';
        $data['priority'] = $data['priority'] ?? 'medium';

        $maxOrder = Task::where('project_id', $project->id)
            ->where('parent_id', $parentTask->id)
            ->max('order');

        $data['order'] = $maxOrder !== null ? $maxOrder + 1 : 0;

        return Task::create($data);
    }
}
