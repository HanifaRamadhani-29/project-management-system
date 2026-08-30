<?php

namespace App\Observers;

use App\Models\Task;
use App\Services\AuditLogService;

class TaskObserver
{
    protected AuditLogService $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        $newValues = [
            'title' => $task->title,
            'status' => $task->status,
            'deadline' => $task->deadline ? $task->deadline->toDateString() : null,
        ];

        $this->auditLogService->log('TASK_CREATED', $task, null, $newValues);
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        // 1. Check specific important transitions first
        if ($task->isDirty('status')) {
            $oldStatus = $task->getOriginal('status');
            $newStatus = $task->status;

            $this->auditLogService->log(
                'TASK_STATUS_CHANGED',
                $task,
                ['status' => $oldStatus],
                ['status' => $newStatus]
            );
            return;
        }

        if ($task->isDirty('deadline')) {
            $oldDeadline = $task->getOriginal('deadline');
            $newDeadline = $task->deadline;

            $oldDeadlineStr = $oldDeadline instanceof \DateTimeInterface ? $oldDeadline->format('Y-m-d') : $oldDeadline;
            $newDeadlineStr = $newDeadline instanceof \DateTimeInterface ? $newDeadline->format('Y-m-d') : $newDeadline;

            $this->auditLogService->log(
                'TASK_DEADLINE_CHANGED',
                $task,
                ['deadline' => $oldDeadlineStr],
                ['deadline' => $newDeadlineStr]
            );
            return;
        }

        // 2. Generic task modification tracking
        $monitoredKeys = ['title', 'description', 'priority', 'assignee_id'];
        $oldValues = [];
        $newValues = [];

        foreach ($monitoredKeys as $key) {
            if ($task->isDirty($key)) {
                $oldValues[$key] = $task->getOriginal($key);
                $newValues[$key] = $task->getAttribute($key);
            }
        }

        if (!empty($newValues)) {
            $this->auditLogService->log('TASK_UPDATED', $task, $oldValues, $newValues);
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        $oldValues = [
            'title' => $task->title,
            'status' => $task->status,
            'deadline' => $task->deadline ? $task->deadline->toDateString() : null,
        ];

        $this->auditLogService->log('TASK_DELETED', $task, $oldValues, null);
    }
}
