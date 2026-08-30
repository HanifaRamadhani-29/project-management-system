<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\DB;

class TaskOrderService
{
    /**
     * Reorder tasks within a project for a specific status.
     *
     * @param int $projectId
     * @param string $newStatus
     * @param array<int> $orderedTaskIds
     * @return void
     */
    public function reorderTasks(int $projectId, string $newStatus, array $orderedTaskIds): void
    {
        DB::transaction(function () use ($projectId, $newStatus, $orderedTaskIds) {
<<<<<<< HEAD
            // FR-DEP-02: Block drag to "done" if any task has unfinished dependencies
            if ($newStatus === 'done') {
                $tasks = Task::whereIn('id', $orderedTaskIds)
                    ->where('project_id', $projectId)
                    ->where('status', '!=', 'done') // Only check tasks being moved TO done
                    ->with('dependencies')
                    ->get();

                foreach ($tasks as $task) {
                    $unfinishedDeps = $task->dependencies->where('status', '!=', 'done');
                    if ($unfinishedDeps->isNotEmpty()) {
                        $names = $unfinishedDeps->pluck('title')->join(', ');
                        throw new \InvalidArgumentException(
                            "Task \"{$task->title}\" tidak dapat diselesaikan karena masih terdapat dependency yang belum selesai: {$names}"
                        );
                    }
                }
            }

=======
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83
            foreach ($orderedTaskIds as $index => $taskId) {
                Task::where('id', $taskId)
                    ->where('project_id', $projectId)
                    ->update([
                        'status' => $newStatus,
                        'order' => $index + 1,
                    ]);
            }
        });
    }
}
