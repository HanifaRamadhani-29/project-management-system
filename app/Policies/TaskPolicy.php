<?php

namespace App\Policies;

<<<<<<< HEAD
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;
=======
use App\Models\Task;
use App\Models\User;
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83

class TaskPolicy
{
    /**
<<<<<<< HEAD
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
=======
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can update the task.
     */
    public function update(User $user, Task $task): bool
    {
        return $user->isMemberOf($task->project) || $user->isProjectManager($task->project);
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83
    }
}
