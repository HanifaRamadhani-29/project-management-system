<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
        'start_date',
        'deadline',
        'manager_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'deadline' => 'date',
    ];

    protected $appends = ['progress', 'is_overdue'];

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(ProjectMessage::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getProgressAttribute(): int
    {
        $totalTasks = $this->tasks()->count();

        if ($totalTasks === 0) {
            return 0;
        }

        $doneTasks = $this->tasks()->where('status', 'done')->count();

        return (int) round(($doneTasks / $totalTasks) * 100);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['completed', 'cancelled'], true)) {
            return false;
        }

        if (!$this->deadline) {
            return false;
        }

        return $this->deadline->lt(now()->startOfDay());
    }
}
