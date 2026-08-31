<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Bypass check for Super Admin.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->role === 'super_admin' || $user->hasRole('Super Admin')) {
            return true;
        }
        return null;
    }

    /**
     * Determine whether the user can view any tasks.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the task.
     */
    public function view(User $user, Task $task): bool
    {
        return $task->project->manager_id === $user->id || 
            $task->project->members()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create tasks.
     */
    public function create(User $user, Project $project): bool
    {
        return $user->can('tasks.create') && (
            $project->manager_id === $user->id || 
            $project->members()->where('users.id', $user->id)->exists()
        );
    }

    /**
     * Determine whether the user can update the task.
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
     * Determine whether the user can comment on the task.
     */
    public function comment(User $user, Task $task): bool
    {
        return $user->can('comments.create') && (
            $task->project->manager_id === $user->id || 
            $task->project->members()->where('users.id', $user->id)->exists()
        );
    }

    /**
     * Determine whether the user can delete the task.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->can('tasks.delete') && (
            $task->project->manager_id === $user->id ||
            $task->reporter_id === $user->id
        );
    }

    /**
     * Determine whether the user can change status of the task.
     */
    public function changeStatus(User $user, Task $task): bool
    {
        return $user->can('tasks.change_status') && (
            $task->project->manager_id === $user->id || 
            $task->project->members()->where('users.id', $user->id)->exists()
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
