<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskApproval;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TaskOrderService
{
    protected AuditLogService $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

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
            $user = auth()->user();
            $project = Project::findOrFail($projectId);

            $isAuthorizedToComplete = $user->role === 'super_admin' 
                || $user->hasRole('Super Admin') 
                || $project->manager_id === $user->id;

            // RULE 1: MEMBER DILARANG DRAG KE 'DONE'
            if ($newStatus === 'done' && !$isAuthorizedToComplete) {
                throw new HttpException(
                    403, 
                    "Akses Ditolak: Member tidak dapat menyelesaikan task secara langsung ke 'Done'. Tugas wajib digeser ke 'Under Review' terlebih dahulu untuk menunggu persetujuan (ACC) dari Project Manager atau Super Admin."
                );
            }

            // RULE 3: VALIDASI TASK DEPENDENCY
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

            // RULE 2: AUTO-CREATE APPROVAL SAAT DRAG KE 'REVIEW'
            if ($newStatus === 'review') {
                $tasks = Task::whereIn('id', $orderedTaskIds)
                    ->where('project_id', $projectId)
                    ->where('status', '!=', 'review')
                    ->get();

                foreach ($tasks as $task) {
                    $pendingApproval = TaskApproval::where('task_id', $task->id)
                        ->where('status', 'Pending')
                        ->exists();
                    
                    if (!$pendingApproval) {
                        TaskApproval::create([
                            'task_id' => $task->id,
                            'requested_by' => $user->id,
                            'status' => 'Pending',
                            'note' => 'Diajukan otomatis melalui pemindahan kartu ke Under Review',
                        ]);

                        $this->auditLogService->log(
                            'TASK_SUBMITTED_FOR_REVIEW',
                            $task,
                            ['status' => $task->status],
                            ['status' => 'review'],
                            $user->id
                        );
                    }
                }
            }

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
