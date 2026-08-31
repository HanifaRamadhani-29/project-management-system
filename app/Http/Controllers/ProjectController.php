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
        $this->authorize('viewAny', Project::class);

        $user = $request->user();
        $query = Project::with(['manager', 'members']);

        if (class_exists('App\Models\Task')) {
            $query->withCount(['tasks', 'tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'done');
            }]);
        }

        // Jika bukan Super Admin, filter hanya project yang di-assign ke user ini
        if ($user->role !== 'super_admin') {
            $query->where(function ($q) use ($user) {
                $q->where('manager_id', $user->id)
                    ->orWhereHas('members', function ($m) use ($user) {
                        $m->where('users.id', $user->id);
                    });
            });
        }

        // Apply filters
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $projects = $query->latest()->paginate(9)->withQueryString();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'status']),
            'users' => User::select('id', 'name', 'email', 'role')->get(),
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

        /** @var \App\Models\User $currentUser */
        $currentUser = $request->user(); // <-- Ganti auth()->user() jadi $request->user()

        $project = $this->projectService->createProject($request->validated(), $currentUser);

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
    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);

        /** @var \App\Models\User $currentUser */
        $currentUser = $request->user(); // <-- Ganti auth()->user() jadi $request->user()

        $this->projectService->updateProject($project, $request->validated(), $currentUser);

        return redirect()->route('projects.index')->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Project $project) // <-- Tambahkan Request $request
    {
        $this->authorize('delete', $project);

        /** @var \App\Models\User $currentUser */
        $currentUser = $request->user(); // <-- Ganti auth()->user() jadi $request->user()

        $this->projectService->deleteProject($project, $currentUser);

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

    public function addMember(Request $request, Project $project)
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

    public function removeMember(Project $project, User $user)
    {
        $this->authorize('update', $project);

        $project->members()->detach($user->id);

        return redirect()->back()->with('success', 'Member removed successfully.');
    }
}
