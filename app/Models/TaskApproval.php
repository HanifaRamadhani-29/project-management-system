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
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
