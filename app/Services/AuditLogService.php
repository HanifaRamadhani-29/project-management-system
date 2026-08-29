<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

class AuditLogService
{
    /**
     * Create an audit log entry for a given model mutation.
     *
     * @param string $action
     * @param Model $model
     * @param array|null $oldValues
     * @param array|null $newValues
     * @param int|null $userId
     * @return AuditLog
     */
    public function log(
        string $action,
        Model $model,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $userId = null
    ): AuditLog {
        // If userId is not explicitly provided, fall back to current authenticated user
        $resolvedUserId = $userId ?? auth()->id();

        // Resolve client IP address if request context exists
        $ipAddress = request() ? request()->ip() : null;

        return AuditLog::create([
            'user_id' => $resolvedUserId,
            'action' => $action,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
            'created_at' => now(),
        ]);
    }
}
