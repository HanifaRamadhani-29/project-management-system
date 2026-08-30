<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskApproval extends Model
{
    /** @use HasFactory<\Database\Factories\TaskApprovalFactory> */
    use HasFactory;

    protected $fillable = [
        'task_id',
        'status',
        'feedback',
        'requested_by',
        'reviewed_by',
        'note',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
