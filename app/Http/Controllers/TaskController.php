<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\TaskReorderRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\TaskOrderService;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    protected TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index(Project $project): JsonResponse
    {
        $this->authorize('viewAny', Task::class);

        $tasks = $project->tasks()
            ->with(['assignee', 'reporter', 'parent', 'subtasks'])
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'tasks' => $tasks,
        ]);
    }

    public function show(Project $project, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $task->load(['assignee', 'reporter', 'parent', 'subtasks', 'comments.user', 'attachments']);

        return response()->json([
            'success' => true,
            'task' => $task,
        ]);
    }

    public function kanban(Project $project): Response
    {
        $project->load('members');

        $tasks = $project->tasks()
            ->with(['assignee', 'reporter', 'comments.user', 'attachments', 'labels', 'subtasks', 'dependencies', 'approvals.requestedBy', 'approvals.reviewedBy'])
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        $allLabels = \App\Models\Label::orderBy('name')->get();

        $users = $project->members->isNotEmpty() ? $project->members : \App\Models\User::all();

        return Inertia::render('Projects/Kanban', [
            'project' => $project,
            'tasks' => $tasks,
            'users' => $users,
            'allLabels' => $allLabels,
            'allProjectTasks' => $project->tasks()->select('id', 'title', 'status')->orderBy('title')->get(),
        ]);
    }

    public function store(StoreTaskRequest $request, Project $project): RedirectResponse
    {
        if (auth()->user()->role !== 'super_admin' && !auth()->user()->can('tasks.create')) {
            abort(403, 'Unauthorized action. You do not have permission to create tasks.');
        }

        $this->authorize('create', [Task::class, $project]);

        $task = $this->taskService->createTask($project, $request->validated(), auth()->user());

        return redirect()->back()->with('success', 'Task created successfully.');
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $this->taskService->updateTask($task, $request->validated());

        return redirect()->back()->with('success', 'Task updated successfully.');
    }

    public function destroy(Project $project, Task $task): RedirectResponse
    {
        if (auth()->user()->role !== 'super_admin' && !auth()->user()->can('tasks.delete')) {
            abort(403, 'Unauthorized action. You do not have permission to delete tasks.');
        }

        $this->authorize('delete', $task);

        $this->taskService->deleteTask($task);

        return redirect()->back()->with('success', 'Task deleted successfully.');
    }

    public function createSubtask(StoreTaskRequest $request, Project $project, Task $task): RedirectResponse
    {
        $this->authorize('create', [Task::class, $project]);

        $this->taskService->createSubtask($project, $task, $request->validated(), auth()->user());

        return redirect()->back()->with('success', 'Subtask created successfully.');
    }

    public function reorder(
        TaskReorderRequest $request,
        Project $project,
        TaskOrderService $taskOrderService
    ): JsonResponse {
        $validated = $request->validated();

        try {
            $taskOrderService->reorderTasks(
                $project->id,
                $validated['status'],
                $validated['ordered_ids']
            );

            return response()->json([
                'success' => true,
                'message' => 'Tasks reordered successfully.',
            ]);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], $e->getStatusCode());
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Sync labels for a task.
     */
    public function syncLabels(\Illuminate\Http\Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'label_ids' => 'array',
            'label_ids.*' => 'integer|exists:labels,id',
        ]);

        $task->labels()->sync($request->input('label_ids', []));

        return redirect()->back()->with('success', 'Labels updated.');
    }

    /**
     * Add a dependency to a task.
     */
    public function addDependency(\Illuminate\Http\Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $request->validate([
            'depends_on_task_id' => 'required|integer|exists:tasks,id|different:task',
        ]);

        $dependsOnId = $request->input('depends_on_task_id');

        // Prevent self-dependency
        if ($dependsOnId == $task->id) {
            return redirect()->back()->withErrors(['depends_on_task_id' => 'Task cannot depend on itself.']);
        }

        // Prevent circular dependency
        $target = Task::find($dependsOnId);
        if ($target && $target->dependencies->contains($task->id)) {
            return redirect()->back()->withErrors(['depends_on_task_id' => 'Circular dependency detected.']);
        }

        $task->dependencies()->syncWithoutDetaching([$dependsOnId]);

        return redirect()->back()->with('success', 'Dependency added.');
    }

    /**
     * Remove a dependency from a task.
     */
    public function removeDependency(Task $task, Task $dependency): RedirectResponse
    {
        $this->authorize('update', $task);

        $task->dependencies()->detach($dependency->id);

        return redirect()->back()->with('success', 'Dependency removed.');
    }
}
