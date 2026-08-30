<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // Filtered at controller level
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        if ($user->hasRole('Super Admin')) return true;
        
        // Only project members can view the task
        return $task->project->members()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Project $project): bool
    {
        if ($user->hasRole('Super Admin')) return true;
        
        // Any project member can create a task
        return $project->members()->where('users.id', $user->id)->exists() || $project->manager_id === $user->id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        if ($user->hasRole('Super Admin')) return true;
        
        // Project Manager, Task Reporter, or Task Assignee can update
        if ($task->project->manager_id === $user->id) return true;
        if ($task->reporter_id === $user->id) return true;
        if ($task->assignee_id === $user->id) return true;
        
        return false;
    }

    public function comment(User $user, Task $task): bool
    {
        if ($user->hasRole('Super Admin')) return true;

        return $task->project->members()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        if ($user->hasRole('Super Admin')) return true;
        
        // Only Project Manager or the Task Reporter can delete
        if ($task->project->manager_id === $user->id) return true;
        if ($task->reporter_id === $user->id) return true;
        
        return false;
    }
}
