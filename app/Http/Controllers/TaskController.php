<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Http\Requests\TaskReorderRequest;
use App\Services\TaskOrderService;
use App\Services\TaskService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    protected TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * Display the Kanban Board for a specific project.
     *
     * @param Project $project
     * @return Response
     */
    public function kanban(Project $project): Response
    {
        // Load tasks ordered by their position 'order'
        $tasks = $project->tasks()
            ->with(['assignee', 'reporter', 'comments.user', 'attachments'])
            ->orderBy('order')
            ->get();

        return Inertia::render('Projects/Kanban', [
            'project' => $project,
            'tasks' => $tasks,
            'users' => $project->members,
        ]);
    }

    /**
     * Store a newly created task in storage.
     */
    public function store(App\Http\Requests\StoreTaskRequest $request, Project $project): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('create', [\App\Models\Task::class, $project]);

        $this->taskService->createTask($project, $request->validated(), auth()->user());

        return redirect()->back()->with('success', 'Task created successfully.');
    }

    /**
     * Update the specified task in storage.
     */
    public function update(App\Http\Requests\UpdateTaskRequest $request, Project $project, \App\Models\Task $task): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('update', $task);

        $this->taskService->updateTask($task, $request->validated());

        return redirect()->back()->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Project $project, \App\Models\Task $task): \Illuminate\Http\RedirectResponse
    {
        $this->authorize('delete', $task);

        $this->taskService->deleteTask($task);

        return redirect()->back()->with('success', 'Task deleted successfully.');
    }

    /**
     * Handle reordering of tasks.
     *
     * @param TaskReorderRequest $request
     * @param Project $project
     * @param App\Services\TaskOrderService $taskOrderService
     * @return JsonResponse
     */
    public function reorder(
        TaskReorderRequest $request,
        Project $project,
        \App\Services\TaskOrderService $taskOrderService
    ): JsonResponse {
        $validated = $request->validated();

        $taskOrderService->reorderTasks(
            $project->id,
            $validated['status'],
            $validated['ordered_ids']
        );

        return response()->json([
            'success' => true,
            'message' => 'Tasks reordered successfully.',
        ]);
    }
}
