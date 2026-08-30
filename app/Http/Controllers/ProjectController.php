<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
    public function index(Request $request)
    {
        $projects = Project::with(['manager', 'members'])
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'done');
            }])
            ->latest()
            ->paginate(9);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters'  => $request->only(['search', 'status']),
            'users'    => User::select('id', 'name', 'email', 'role')->get(),
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
        if (auth()->user()->role === 'member' || auth()->user()->role === 'viewer') {
            abort(403, 'Unauthorized action. Members cannot create projects.');
        }

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

        $relations = ['members'];
        if (class_exists('App\Models\Task')) {
            $relations[] = 'tasks';
        }
        $project->load($relations);
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

    public function addMember(\Illuminate\Http\Request $request, Project $project)
    {
        $this->authorize('update', $project);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:project_manager,member,viewer',
        ]);

        $project->members()->syncWithoutDetaching([
            $request->user_id => ['role' => $request->role]
        ]);

        return redirect()->back()->with('success', 'Member added successfully.');
    }

    public function removeMember(Project $project, \App\Models\User $user)
    {
        $this->authorize('update', $project);

        $project->members()->detach($user->id);

        return redirect()->back()->with('success', 'Member removed successfully.');
    }
}
