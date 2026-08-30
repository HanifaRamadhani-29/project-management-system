<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    /** @use HasFactory<\Database\Factories\ActivityLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_value',
        'new_value',
        'timestamp',
    ];

    protected $casts = [
        'old_value' => 'array',
        'new_value' => 'array',
        'timestamp' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loggable()
    {
        return $this->morphTo('entity');
    }
}
