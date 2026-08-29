<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Http\Requests\ProjectStoreRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects based on the user's role.
     */
    public function index(): Response
    {
        $user = auth()->user();

        // 1. Fetch projects according to role
        if ($user->hasRole('Super Admin')) {
            $projectsQuery = Project::query();
        } else {
            // Managed projects OR projects where the user is a member
            $projectsQuery = Project::where('manager_id', $user->id)
                ->orWhereHas('members', function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                });
        }

        $projects = $projectsQuery->with(['manager', 'members'])
            ->withCount('tasks')
            ->latest()
            ->get();

        // 2. Fetch managers and all users for modal selections
        $managers = User::role(['Project Manager', 'Super Admin'])->get(['id', 'name']);
        $allUsers = User::get(['id', 'name', 'email']);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'managers' => $managers,
            'allUsers' => $allUsers,
        ]);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(ProjectStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        // Generate unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $counter = 1;
        while (Project::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        $validated['slug'] = $slug;

        Project::create($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Update the specified project in storage.
     */
    public function update(ProjectStoreRequest $request, Project $project): RedirectResponse
    {
        $user = auth()->user();
        
        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');

        // Authorize: Super Admin OR Project Manager assigned to the project
        if (!$isSuperAdmin && $project->manager_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validated();

        // Update slug if name changes
        if ($validated['name'] !== $project->name) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $counter = 1;
            while (Project::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $slug;
        }

        $project->update($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $user = auth()->user();

        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');

        // Authorize: Super Admin OR Project Manager assigned to the project
        if (!$isSuperAdmin && $project->manager_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project deleted successfully.');
    }

    /**
     * Add a member to the project.
     */
    public function addMember(Project $project, Request $request): RedirectResponse
    {
        $user = auth()->user();

        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');

        // Authorize
        if (!$isSuperAdmin && $project->manager_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $project->members()->syncWithoutDetaching([$request->user_id]);

        return redirect()->route('projects.index')
            ->with('success', 'Member added to project successfully.');
    }

    /**
     * Remove a member from the project.
     */
    public function removeMember(Project $project, User $member): RedirectResponse
    {
        $user = auth()->user();

        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');

        // Authorize
        if (!$isSuperAdmin && $project->manager_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $project->members()->detach($member->id);

        return redirect()->route('projects.index')
            ->with('success', 'Member removed from project successfully.');
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): Response
    {
        $user = auth()->user();

        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');

        // Authorize: Super Admin OR Project Manager OR Project Member
        if (!$isSuperAdmin 
            && $project->manager_id !== $user->id 
            && !$project->members->contains($user->id)
        ) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Projects/Show', [
            'project' => $project->load(['manager', 'members']),
        ]);
    }
}
