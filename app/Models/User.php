<?php

namespace App\Models;

use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * RBAC: Check if user is Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * RBAC: Check if user is Project Manager of a specific project.
     */
    public function isProjectManager(Project $project): bool
    {
        return $this->role === 'project_manager' && $project->manager_id === $this->id;
    }

    /**
     * RBAC: Check if user is a member of a specific project.
     */
    public function isMemberOf(Project $project): bool
    {
        return $project->members()->where('user_id', $this->id)->exists();
    }

    /**
     * Get the projects associated with the user.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user', 'user_id', 'project_id')->withTimestamps();
    }

    /**
     * Get the tasks assigned to the user.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }
}
