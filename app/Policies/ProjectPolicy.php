<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
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
     * Determine whether the user can view any projects.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        return $user->id === $project->manager_id 
            || $project->members()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create projects.
     */
    public function create(User $user): bool
    {
        return $user->role === 'super_admin' || $user->can('projects.create');
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        return $user->role === 'super_admin' || ($user->can('projects.edit') && $project->manager_id === $user->id);
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->role === 'super_admin' || $user->can('projects.delete');
    }

    /**
     * Determine whether the user can manage project members.
     */
    public function manageMembers(User $user, Project $project): bool
    {
        return $user->role === 'super_admin' || ($user->can('projects.manage_members') && $project->manager_id === $user->id);
    }
}
