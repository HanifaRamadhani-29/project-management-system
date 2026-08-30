<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'super_admin' || $user->hasRole('Super Admin')) {
            return true;
        }
        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        return $task->project->members()->where('users.id', $user->id)->exists() 
            || $task->project->manager_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Project $project): bool
    {
        return $user->can('tasks.create') && (
            $project->members()->where('users.id', $user->id)->exists() 
            || $project->manager_id === $user->id
        );
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        return $user->can('tasks.edit') && (
            $task->project->manager_id === $user->id ||
            $task->reporter_id === $user->id ||
            $task->assignee_id === $user->id ||
            $task->project->members()->where('users.id', $user->id)->exists()
        );
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->can('tasks.delete') && (
            $task->project->manager_id === $user->id ||
            $task->reporter_id === $user->id
        );
    }

    /**
     * Determine whether the user can comment on the task.
     */
    public function comment(User $user, Task $task): bool
    {
        return $task->project->members()->where('users.id', $user->id)->exists() 
            || $task->project->manager_id === $user->id;
    }

    /**
     * Determine whether the user can change status of the task.
     */
    public function changeStatus(User $user, Task $task): bool
    {
        return $user->can('tasks.change_status') && (
            $task->project->members()->where('users.id', $user->id)->exists() 
            || $task->project->manager_id === $user->id
        );
    }

    /**
     * Determine whether the user can approve the task.
     */
    public function approve(User $user, Task $task): bool
    {
        return $user->can('tasks.approve') && (
            $task->project->manager_id === $user->id
        );
    }
}
