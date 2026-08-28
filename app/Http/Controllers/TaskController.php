<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Http\Requests\TaskReorderRequest;
use App\Services\TaskOrderService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
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
            ->with(['assignee', 'reporter'])
            ->orderBy('order')
            ->get();

        return Inertia::render('Projects/Kanban', [
            'project' => $project,
            'tasks' => $tasks,
        ]);
    }

    /**
     * Handle reordering of tasks.
     *
     * @param TaskReorderRequest $request
     * @param Project $project
     * @param TaskOrderService $taskOrderService
     * @return JsonResponse
     */
    public function reorder(
        TaskReorderRequest $request,
        Project $project,
        TaskOrderService $taskOrderService
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
