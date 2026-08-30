<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskApproval;
use App\Services\TaskApprovalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskApprovalController extends Controller
{
    protected TaskApprovalService $taskApprovalService;

    public function __construct(TaskApprovalService $taskApprovalService)
    {
        $this->taskApprovalService = $taskApprovalService;
    }

    /**
     * Display a listing of approvals.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = TaskApproval::with(['task.project', 'task.assignee', 'task.attachments', 'task.dependencies', 'requestedBy', 'reviewedBy']);

        if ($user->role !== 'super_admin' && !$user->hasRole('Super Admin')) {
            // Get all project IDs user is involved in (managed or member)
            $projectIds = $user->managedProjects()->pluck('id')
                ->merge($user->projects()->pluck('projects.id'))
                ->unique();
            
            $query->whereHas('task', function ($q) use ($projectIds) {
                $q->whereIn('project_id', $projectIds);
            });
        }

        $approvals = $query->latest()->get();

        return Inertia::render('Approvals/Index', [
            'approvals' => $approvals,
        ]);
    }

    /**
     * Submit task for review.
     */
    public function submitForReview(Request $request, Task $task)
    {
        $this->authorize('changeStatus', $task);

        $validated = $request->validate([
            'note' => 'nullable|string',
        ]);

        $this->taskApprovalService->submitForReview($task, $validated, $request->user());

        return back()->with('success', 'Task submitted for review');
    }

    /**
     * Approve task.
     */
    public function approve(Request $request, Task $task)
    {
        $user = $request->user();
        $project = $task->project;
        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');
        $isProjectPM = $project->manager_id === $user->id || $project->members()->where('user_id', $user->id)->whereIn('project_user.role', ['Project Manager', 'project_manager'])->exists();

        if (!$isSuperAdmin && !$isProjectPM) {
            abort(403, 'Unauthorized action. Only Project Managers or Super Admins can approve tasks.');
        }

        try {
            $this->taskApprovalService->approve($task, $user);
            return back()->with('success', 'Task approved successfully');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Request revision / Reject task.
     */
    public function requestRevision(Request $request, Task $task)
    {
        $user = $request->user();
        $project = $task->project;
        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');
        $isProjectPM = $project->manager_id === $user->id || $project->members()->where('user_id', $user->id)->whereIn('project_user.role', ['Project Manager', 'project_manager'])->exists();

        if (!$isSuperAdmin && !$isProjectPM) {
            abort(403, 'Unauthorized action. Only Project Managers or Super Admins can request revisions.');
        }

        $validated = $request->validate([
            'feedback' => 'required|string',
        ]);

        $this->taskApprovalService->requestRevision($task, $validated, $user);

        return back()->with('success', 'Revision requested successfully');
    }
}
