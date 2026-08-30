<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
<<<<<<< HEAD
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // Semua user bisa lihat daftar project, tapi difilter di service.
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Project $project): bool
    {
        if ($user->hasRole('Super Admin') || $user->role === 'super_admin') return true;
        if ($project->manager_id === $user->id) return true;

        return $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('Super Admin') || $user->role === 'super_admin' || $user->hasRole('Project Manager') || $user->role === 'project_manager';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        if ($user->hasRole('Super Admin') || $user->role === 'super_admin') return true;

        return $project->manager_id === $user->id || $project->members()
            ->where('user_id', $user->id)
            ->whereIn('project_user.role', ['Project Manager', 'project_manager'])
            ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->hasRole('Super Admin') || $user->role === 'super_admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Project $project): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Project $project): bool
    {
        return false;
=======
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
<<<<<<< HEAD
        if ($user->role === 'super_admin' || $user->hasRole('Super Admin')) {
=======
        if ($user->role === 'super_admin' || (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin())) {
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
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
<<<<<<< HEAD
        return $user->role === 'super_admin' || $user->can('projects.create');
=======
        return $user->role === 'super_admin' 
            || $user->role === 'project_manager';
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
<<<<<<< HEAD
        return $user->role === 'super_admin' || ($user->can('projects.edit') && $project->manager_id === $user->id);
=======
        return $user->id === $project->manager_id;
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
<<<<<<< HEAD
        return $user->role === 'super_admin' || $user->can('projects.delete');
    }

    /**
     * Determine whether the user can manage project members.
     */
    public function manageMembers(User $user, Project $project): bool
    {
        return $user->role === 'super_admin' || ($user->can('projects.manage_members') && $project->manager_id === $user->id);
=======
        return $user->id === $project->manager_id;
>>>>>>> feature/project
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }
}
