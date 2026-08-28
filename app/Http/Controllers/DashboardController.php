<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\DB;
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

        // Check if the user has the Spatie role 'Super Admin'
        if ($user && $user->hasRole('Super Admin')) {
            return $this->renderAdminDashboard();
        }

        // Otherwise render default member dashboard
        return $this->renderMemberDashboard();
    }

    /**
     * Render the Super Admin Dashboard with efficient DB aggregations.
     *
     * @return Response
     */
    protected function renderAdminDashboard(): Response
    {
        $now = now()->toDateString();

        // 1. Projects statistics
        $totalProjects = Project::count();
        $activeProjects = Project::where('status', 'active')->count();
        $overdueProjects = Project::where('status', '!=', 'completed')
            ->whereNotNull('deadline')
            ->where('deadline', '<', $now)
            ->count();

        // 2. Tasks statistics
        $totalTasks = Task::count();
        $completedTasks = Task::where('status', 'done')->count();
        $overdueTasks = Task::where('status', '!=', 'done')
            ->whereNotNull('deadline')
            ->where('deadline', '<', $now)
            ->count();

        // Completion Rate
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // 3. Tasks by status - Aggregated query
        $tasksByStatus = Task::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $statuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
        $tasksByStatusResult = [];
        foreach ($statuses as $status) {
            $tasksByStatusResult[$status] = $tasksByStatus[$status] ?? 0;
        }

        // 4. Team workloads: Top 5 members with active task counts
        $teamWorkloads = User::select('users.id', 'users.name', 'users.email')
            ->selectRaw('count(tasks.id) as active_tasks_count')
            ->join('tasks', 'tasks.assignee_id', '=', 'users.id')
            ->where('tasks.status', '!=', 'done')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('active_tasks_count')
            ->take(5)
            ->get();

        // 5. Recent projects: 5 latest projects with PMs and progress percentages (Anti-N+1)
        $recentProjects = Project::with('manager')
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
                $progress = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;

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
            });

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
            'tasks_by_status' => $tasksByStatusResult,
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
        $user = auth()->user();

        // Get the list of project IDs associated with the user (managed or as a member)
        $projectIds = Project::where('manager_id', $user->id)
            ->orWhereHas('members', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->pluck('id');

        // Total, Active, and Overdue Projects
        $totalProjects = $projectIds->count();
        $activeProjects = Project::whereIn('id', $projectIds)->where('status', 'active')->count();
        $overdueProjects = Project::whereIn('id', $projectIds)
            ->where('status', '!=', 'completed')
            ->whereNotNull('deadline')
            ->where('deadline', '<', now()->toDateString())
            ->count();

        // Tasks in these projects
        $totalTasks = Task::whereIn('project_id', $projectIds)->count();
        $completedTasks = Task::whereIn('project_id', $projectIds)->where('status', 'done')->count();
        $overdueTasks = Task::whereIn('project_id', $projectIds)
            ->where('status', '!=', 'done')
            ->whereNotNull('deadline')
            ->where('deadline', '<', now()->toDateString())
            ->count();

        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Tasks distribution by status
        $tasksByStatus = Task::whereIn('project_id', $projectIds)
            ->select('status', \DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $statuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
        $tasksByStatusResult = [];
        foreach ($statuses as $status) {
            $tasksByStatusResult[$status] = $tasksByStatus[$status] ?? 0;
        }

        // Top 5 members workload
        $teamWorkloads = User::whereHas('projects', function ($query) use ($projectIds) {
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
                    'active_tasks_count' => $u->tasks_count,
                ];
            });

        // 5 most recent projects with PM and completion rate progress percentage
        $recentProjects = Project::whereIn('id', $projectIds)
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
                $progress = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;

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
            });

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_projects' => sprintf("%02d", $totalProjects),
                'active_projects' => sprintf("%02d", $activeProjects),
                'overdue_projects' => sprintf("%02d", $overdueProjects),
                'total_tasks' => sprintf("%02d", $totalTasks),
                'completed_tasks' => sprintf("%02d", $completedTasks),
                'overdue_tasks' => sprintf("%02d", $overdueTasks),
                'completion_rate' => $completionRate,
            ],
            'tasks_by_status' => $tasksByStatusResult,
            'team_workloads' => $teamWorkloads,
            'recent_projects' => $recentProjects,
        ]);
    }
}
