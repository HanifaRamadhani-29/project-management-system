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
<<<<<<< HEAD
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
=======
        return true; // Filtered at controller level
    }

    /**
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
<<<<<<< HEAD
        return $task->project->members()->where('users.id', $user->id)->exists() 
            || $task->project->manager_id === $user->id;
=======
        if ($user->hasRole('Super Admin')) return true;
        
        // Only project members can view the task
        return $task->project->members()->where('users.id', $user->id)->exists();
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Project $project): bool
    {
<<<<<<< HEAD
        return $user->can('tasks.create') && (
            $project->members()->where('users.id', $user->id)->exists() 
            || $project->manager_id === $user->id
        );
=======
        if ($user->hasRole('Super Admin')) return true;
        
        // Any project member can create a task
        return $project->members()->where('users.id', $user->id)->exists() || $project->manager_id === $user->id;
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
<<<<<<< HEAD
        return $user->can('tasks.edit') && (
            $task->project->manager_id === $user->id ||
            $task->reporter_id === $user->id ||
            $task->assignee_id === $user->id ||
            $task->project->members()->where('users.id', $user->id)->exists()
        );
=======
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
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
<<<<<<< HEAD
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
=======
        if ($user->hasRole('Super Admin')) return true;
        
        // Only Project Manager or the Task Reporter can delete
        if ($task->project->manager_id === $user->id) return true;
        if ($task->reporter_id === $user->id) return true;
        
        return false;
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }
}
