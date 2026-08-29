<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard page depending on the user's role.
     *
     * @return Response
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Check if the user has the Spatie role 'Super Admin' or the db column role 'super_admin'
        $isSuperAdmin = $user && ($user->role === 'super_admin' || $user->hasRole('Super Admin'));

        if ($isSuperAdmin) {
            return $this->renderAdminDashboard();
        }

        // Otherwise render default member dashboard
        return $this->renderMemberDashboard();
    }

    /**
     * Render the Super Admin Dashboard with database table checks for cross-branch compatibility.
     *
     * @return Response
     */
    protected function renderAdminDashboard(): Response
    {
        $now = now()->toDateString();
        
        // Check if the database tables actually exist to prevent SQLSTATE[42S02] exceptions
        $hasProjectTable = Schema::hasTable('projects');
        $hasTaskTable = Schema::hasTable('tasks');
        $hasUserTable = Schema::hasTable('users');

        // 1. Projects statistics
        $totalProjects = $hasProjectTable ? \App\Models\Project::count() : 0;
        $activeProjects = $hasProjectTable ? \App\Models\Project::where('status', 'active')->count() : 0;
        $overdueProjects = $hasProjectTable ? \App\Models\Project::where('status', '!=', 'completed')
            ->whereNotNull('deadline')
            ->where('deadline', '<', $now)
            ->count() : 0;

        // 2. Tasks statistics
        $totalTasks = $hasTaskTable ? \App\Models\Task::count() : 0;
        $completedTasks = $hasTaskTable ? \App\Models\Task::where('status', 'done')->count() : 0;
        $overdueTasks = $hasTaskTable ? \App\Models\Task::where('status', '!=', 'done')
            ->whereNotNull('deadline')
            ->where('deadline', '<', $now)
            ->count() : 0;

        // Completion Rate
        $completionRate = $totalTasks > 0 ? (int) round(($completedTasks / $totalTasks) * 100) : 0;

        // 3. Tasks by status
        $tasksByStatusResult = [];
        $statuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
        
        if ($hasTaskTable) {
            $tasksByStatus = \App\Models\Task::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            foreach ($statuses as $status) {
                $tasksByStatusResult[$status] = $tasksByStatus[$status] ?? 0;
            }
        } else {
            foreach ($statuses as $status) {
                $tasksByStatusResult[$status] = 0;
            }
        }

        // 4. Team workloads
        $teamWorkloads = [];
        if ($hasUserTable && $hasTaskTable) {
            $teamWorkloads = \App\Models\User::select('users.id', 'users.name', 'users.email')
                ->selectRaw('count(tasks.id) as active_tasks_count')
                ->join('tasks', 'tasks.assignee_id', '=', 'users.id')
                ->where('tasks.status', '!=', 'done')
                ->whereNull('tasks.deleted_at')
                ->groupBy('users.id', 'users.name', 'users.email')
                ->orderByDesc('active_tasks_count')
                ->take(5)
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'task_count' => $u->active_tasks_count,
                    ];
                })
                ->toArray();
        }

        // 5. Recent projects
        $recentProjects = [];
        if ($hasProjectTable) {
            $recentProjects = \App\Models\Project::with('manager')
                ->withCount([
                    'tasks as total_tasks_count',
                    'tasks as completed_tasks_count' => function ($query) {
                        $query->where('status', 'done');
                    }
                ])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($project) {
                    $totalCount = $project->total_tasks_count;
                    $completedCount = $project->completed_tasks_count;
                    $progress = $totalCount > 0 ? (int) round(($completedCount / $totalCount) * 100) : 0;

                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'slug' => $project->slug,
                        'status' => $project->status,
                        'deadline' => $project->deadline ? $project->deadline->format('Y-m-d') : null,
                        'manager' => $project->manager ? [
                            'id' => $project->manager->id,
                            'name' => $project->manager->name,
                        ] : null,
                        'progress' => $progress,
                    ];
                })
                ->toArray();
        }

        return Inertia::render('Dashboard/AdminDashboard', [
            'stats' => [
                'total_projects' => sprintf("%02d", $totalProjects),
                'active_projects' => sprintf("%02d", $activeProjects),
                'overdue_projects' => sprintf("%02d", $overdueProjects),
                'total_tasks' => sprintf("%02d", $totalTasks),
                'completed_tasks' => sprintf("%02d", $completedTasks),
                'overdue_tasks' => sprintf("%02d", $overdueTasks),
                'completion_rate' => $completionRate,
            ],
            'task_distribution' => $tasksByStatusResult,
            'tasks_by_status' => $tasksByStatusResult,
            'member_workloads' => $teamWorkloads,
            'team_workloads' => $teamWorkloads,
            'recent_projects' => $recentProjects,
        ]);
    }

    /**
     * Render the default member dashboard.
     *
     * @return Response
     */
    protected function renderMemberDashboard(): Response
    {
        $hasProjectTable = Schema::hasTable('projects');
        $hasTaskTable = Schema::hasTable('tasks');
        $hasUserTable = Schema::hasTable('users');

        $totalProjects = 0;
        $activeProjects = 0;
        $overdueProjects = 0;
        $totalTasks = 0;
        $completedTasks = 0;
        $overdueTasks = 0;
        $completionRate = 0;
        $tasksByStatusResult = [];
        $teamWorkloads = [];
        $recentProjects = [];

        $statuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
        foreach ($statuses as $status) {
            $tasksByStatusResult[$status] = 0;
        }

        if ($hasProjectTable && $hasUserTable) {
            $user = auth()->user();
            $projectIds = \App\Models\Project::where('manager_id', $user->id)
                ->orWhereHas('members', function ($query) use ($user) {
                    $query->where('users.id', $user->id);
                })
                ->pluck('id');

            $totalProjects = $projectIds->count();
            $activeProjects = \App\Models\Project::whereIn('id', $projectIds)->where('status', 'active')->count();
            $overdueProjects = \App\Models\Project::whereIn('id', $projectIds)
                ->where('status', '!=', 'completed')
                ->whereNotNull('deadline')
                ->where('deadline', '<', now()->toDateString())
                ->count();

            if ($hasTaskTable) {
                $totalTasks = \App\Models\Task::whereIn('project_id', $projectIds)->count();
                $completedTasks = \App\Models\Task::whereIn('project_id', $projectIds)->where('status', 'done')->count();
                $overdueTasks = \App\Models\Task::whereIn('project_id', $projectIds)
                    ->where('status', '!=', 'done')
                    ->whereNotNull('deadline')
                    ->where('deadline', '<', now()->toDateString())
                    ->count();

                $completionRate = $totalTasks > 0 ? (int) round(($completedTasks / $totalTasks) * 100) : 0;

                $tasksByStatus = \App\Models\Task::whereIn('project_id', $projectIds)
                    ->select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->pluck('count', 'status')
                    ->toArray();

                foreach ($statuses as $status) {
                    $tasksByStatusResult[$status] = $tasksByStatus[$status] ?? 0;
                }

                $teamWorkloads = \App\Models\User::whereHas('projects', function ($query) use ($projectIds) {
                        $query->whereIn('projects.id', $projectIds);
                    })
                    ->withCount(['tasks' => function ($query) use ($projectIds) {
                        $query->whereIn('project_id', $projectIds)->where('status', '!=', 'done');
                    }])
                    ->orderByDesc('tasks_count')
                    ->take(5)
                    ->get(['id', 'name', 'email'])
                    ->map(function ($u) {
                        return [
                            'id' => $u->id,
                            'name' => $u->name,
                            'email' => $u->email,
                            'task_count' => $u->tasks_count,
                        ];
                    })
                    ->toArray();
            }

            $recentProjects = \App\Models\Project::whereIn('id', $projectIds)
                ->with('manager')
                ->withCount([
                    'tasks as total_tasks_count',
                    'tasks as completed_tasks_count' => function ($query) {
                        $query->where('status', 'done');
                    }
                ])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($project) {
                    $totalCount = $project->total_tasks_count;
                    $completedCount = $project->completed_tasks_count;
                    $progress = $totalCount > 0 ? (int) round(($completedCount / $totalCount) * 100) : 0;

                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'slug' => $project->slug,
                        'status' => $project->status,
                        'deadline' => $project->deadline ? $project->deadline->format('Y-m-d') : null,
                        'manager' => $project->manager ? [
                            'id' => $project->manager->id,
                            'name' => $project->manager->name,
                        ] : null,
                        'progress' => $progress,
                    ];
                })
                ->toArray();
        }

        return Inertia::render('Dashboard/AdminDashboard', [
            'stats' => [
                'total_projects' => sprintf("%02d", $totalProjects),
                'active_projects' => sprintf("%02d", $activeProjects),
                'overdue_projects' => sprintf("%02d", $overdueProjects),
                'total_tasks' => sprintf("%02d", $totalTasks),
                'completed_tasks' => sprintf("%02d", $completedTasks),
                'overdue_tasks' => sprintf("%02d", $overdueTasks),
                'completion_rate' => $completionRate,
            ],
            'task_distribution' => $tasksByStatusResult,
            'tasks_by_status' => $tasksByStatusResult,
            'member_workloads' => $teamWorkloads,
            'team_workloads' => $teamWorkloads,
            'recent_projects' => $recentProjects,
        ]);
    }
}
