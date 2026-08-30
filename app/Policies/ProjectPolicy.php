<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
<<<<<<< HEAD
use Illuminate\Auth\Access\Response;
=======
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83

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
        if ($user->hasRole('Super Admin')) return true;

        return $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('Super Admin') || $user->hasRole('Project Manager');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        if ($user->hasRole('Super Admin')) return true;

        return $project->members()
            ->where('user_id', $user->id)
            ->where('role', 'Project Manager')
            ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->hasRole('Super Admin');
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
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        return $user->isProjectManager($project) || $user->isMemberOf($project);
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        return $user->isProjectManager($project);
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->isProjectManager($project);
>>>>>>> bb195537a83faecd4dce9183ecbecb7674323a83
    }
}
