<?php

namespace App\Models;

use Spatie\Permission\Traits\HasRoles;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

<<<<<<< HEAD

#[Fillable(['name', 'username', 'email', 'password', 'role'])]
=======
<<<<<<< HEAD

#[Fillable(['name', 'username', 'email', 'password', 'role'])]
=======
#[Fillable(['name', 'email', 'password', 'role'])]
>>>>>>> feature/project
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
<<<<<<< HEAD
     * Get the projects the user belongs to as a member.
     */
    public function projects(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user', 'user_id', 'project_id')->withTimestamps();
    }

    /**
=======
<<<<<<< HEAD
=======
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
     * Get the projects managed by the user.
     */
    public function managedProjects(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Project::class, 'manager_id');
    }

    /**
<<<<<<< HEAD
=======
>>>>>>> feature/project
     * Get the projects the user belongs to as a member.
     */
    public function projects(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user', 'user_id', 'project_id')->withTimestamps();
    }

<<<<<<< HEAD
    /**
     * Get the projects managed by the user.
     */
    public function managedProjects(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Project::class, 'manager_id');
    }

=======
>>>>>>> feature/project
    /**
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
     * Get the tasks assigned to the user.
     */
    public function tasks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }
}
