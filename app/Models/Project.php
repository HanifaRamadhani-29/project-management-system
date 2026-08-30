<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'status',
        'description',
        'start_date',
        'deadline',
        'manager_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'deadline' => 'date',
    ];

    protected $appends = ['progress', 'is_overdue'];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Get the tasks for the project.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the project manager.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the project members.
     */
    public function members(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user', 'project_id', 'user_id')->withTimestamps();
    }

    /**
     * Get the project task completion progress percentage.
     */
    public function getProgressAttribute(): int
    {
        $total = $this->tasks()->count();
        $completed = $this->tasks()->where('status', 'done')->count();
        return $total > 0 ? (int) round(($completed / $total) * 100) : 0;
    }

    /**
     * Determine if the project is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status !== 'completed' && $this->deadline && $this->deadline->isPast();
    }

    /**
     * Get the project chat messages.
     */
    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectMessage::class);
    }
}
