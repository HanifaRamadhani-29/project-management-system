<?php

namespace App\Observers;

use App\Models\Project;
use App\Services\AuditLogService;

class ProjectObserver
{
    protected AuditLogService $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        $newValues = [
            'name' => $project->name,
            'status' => $project->status,
            'deadline' => $project->deadline ? $project->deadline->toDateString() : null,
        ];

        $this->auditLogService->log('PROJECT_CREATED', $project, null, $newValues);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        $monitoredKeys = ['name', 'status', 'deadline'];
        $oldValues = [];
        $newValues = [];

        foreach ($monitoredKeys as $key) {
            if ($project->isDirty($key)) {
                $oldVal = $project->getOriginal($key);
                $newVal = $project->getAttribute($key);

                if ($oldVal instanceof \DateTimeInterface) {
                    $oldVal = $oldVal->format('Y-m-d');
                }
                if ($newVal instanceof \DateTimeInterface) {
                    $newVal = $newVal->format('Y-m-d');
                }

                $oldValues[$key] = $oldVal;
                $newValues[$key] = $newVal;
            }
        }

        if (!empty($newValues)) {
            $this->auditLogService->log('PROJECT_UPDATED', $project, $oldValues, $newValues);
        }
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        $oldValues = [
            'name' => $project->name,
            'status' => $project->status,
            'deadline' => $project->deadline ? $project->deadline->toDateString() : null,
        ];

        $this->auditLogService->log('PROJECT_DELETED', $project, $oldValues, null);
    }
}
