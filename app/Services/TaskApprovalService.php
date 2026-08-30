<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskApproval;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TaskApprovalService
{
    protected AuditLogService $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    /**
     * Submit a task for review.
     */
    public function submitForReview(Task $task, array $data, User $user): TaskApproval
    {
        return DB::transaction(function () use ($task, $data, $user) {
            // Update task status
            $task->status = 'review';
            $task->save();

            // Create approval request
            $approval = TaskApproval::create([
                'task_id' => $task->id,
                'status' => 'Pending',
                'requested_by' => $user->id,
                'note' => $data['note'] ?? null,
            ]);

            // Log activity
            $this->auditLogService->log(
                'TASK_SUBMITTED_FOR_REVIEW',
                $task,
                ['status' => 'in_progress'],
                ['status' => 'review'],
                $user->id
            );

            return $approval;
        });
    }

    /**
     * Approve a task.
     */
    public function approve(Task $task, User $reviewer): TaskApproval
    {
        return DB::transaction(function () use ($task, $reviewer) {
            // Check dependencies
            $uncompletedDependencies = $task->dependencies()
                ->where('status', '!=', 'done')
                ->get(['tasks.id', 'tasks.title', 'tasks.status']);

            if ($uncompletedDependencies->isNotEmpty()) {
                $taskTitles = $uncompletedDependencies->pluck('title')->implode('", "');
                abort(422, "Task tidak dapat disetujui / diselesaikan karena masih terdapat dependency yang belum selesai: \"{$taskTitles}\". Selesaikan task tersebut terlebih dahulu.");
            }

            // Find the pending approval
            $approval = $task->approvals()->where('status', 'Pending')->latest()->first();

            if (!$approval) {
                $approval = new TaskApproval(['task_id' => $task->id]);
            }

            // Update approval status
            $approval->status = 'Approved';
            $approval->reviewed_by = $reviewer->id;
            $approval->save();

            // Update task status
            $oldStatus = $task->status;
            $task->status = 'done';
            $task->save();

            // Log activity
            $this->auditLogService->log(
                'TASK_APPROVED',
                $task,
                ['status' => $oldStatus],
                ['status' => 'done'],
                $reviewer->id
            );

            return $approval;
        });
    }

    /**
     * Request a revision for a task.
     */
    public function requestRevision(Task $task, array $data, User $reviewer): TaskApproval
    {
        return DB::transaction(function () use ($task, $data, $reviewer) {
            // Find the pending approval
            $approval = $task->approvals()->where('status', 'Pending')->latest()->first();

            if (!$approval) {
                $approval = new TaskApproval(['task_id' => $task->id]);
            }

            // Update approval status
            $approval->status = 'Revision Required';
            $approval->reviewed_by = $reviewer->id;
            $approval->feedback = $data['feedback'];
            $approval->save();

            // Update task status
            $oldStatus = $task->status;
            $task->status = 'in_progress';
            $task->save();

            // Log activity
            $this->auditLogService->log(
                'TASK_REVISION_REQUESTED',
                $task,
                ['status' => $oldStatus],
                ['status' => 'in_progress'],
                $reviewer->id
            );

            return $approval;
        });
    }
}
