<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ProjectController extends Controller
{
    use AuthorizesRequests;

    protected $projectService;

    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $this->authorize('viewAny', Project::class);
        $filters = $request->only(['search', 'status']);
        $projects = $this->projectService->getAllProjects(auth()->user(), $filters);
        
        return inertia('Projects/Index', [
            'projects' => $projects,
            'filters' => $filters
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Project::class);
        return inertia('Projects/Create', [
            'users' => User::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $this->authorize('create', Project::class);
        $project = $this->projectService->createProject($request->validated(), auth()->user());
        
        return redirect()->route('projects.index')->with('success', 'Project created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $this->authorize('view', $project);

        $project->load(['members', 'tasks', 'manager']);
        $users = User::all();

        // Task counts for Task Overview
        $taskCounts = [
            'todo' => $project->tasks()->whereIn('status', ['backlog', 'todo'])->count(),
            'in_progress' => $project->tasks()->whereIn('status', ['in_progress', 'review'])->count(),
            'done' => $project->tasks()->where('status', 'done')->count(),
        ];

        return inertia('Projects/Show', [
            'project' => $project,
            'members' => $project->members,
            'users' => $users,
            'taskCounts' => $taskCounts,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        $this->authorize('update', $project);
        return inertia('Projects/Edit', [
            'project' => $project,
            'users' => User::all()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);
        $this->projectService->updateProject($project, $request->validated(), auth()->user());
        
        return redirect()->route('projects.index')->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);
        $this->projectService->deleteProject($project, auth()->user());
        
        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }

    /**
     * Store a member to the project.
     */
    public function storeMember(StoreMemberRequest $request, Project $project)
    {
        $this->authorize('update', $project);

        try {
            $this->projectService->addMember((int) $project->id, (int) $request->validated()['user_id'], (string) $request->validated()['role']);

            return redirect()->back()->with('success', 'Member added successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Add a member to the project.
     */
    public function addMember(\Illuminate\Http\Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role' => 'required|string',
        ]);

        try {
            $this->projectService->addMember((int) $project->id, (int) $request->user_id, (string) $request->role);

            return redirect()->back()->with('success', 'Member added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['user_id' => $e->getMessage()]);
        }
    }

    /**
     * Remove a member from the project.
     */
    public function removeMember(Project $project, \App\Models\User $member)
    {
        $this->authorize('update', $project);

        try {
            $this->projectService->removeMember($project, (int) $member->id);

            return redirect()->back()->with('success', 'Member removed successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
