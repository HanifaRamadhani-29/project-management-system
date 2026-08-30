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
