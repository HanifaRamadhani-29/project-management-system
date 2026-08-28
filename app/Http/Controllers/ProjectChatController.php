<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectChatController extends Controller
{
    /**
     * Authorize access to the project chat room.
     */
    private function authorizeProjectAccess(Project $project): void
    {
        $user = auth()->user();
        if (!$user->hasRole('Super Admin') && $project->manager_id !== $user->id && !$project->members()->where('users.id', $user->id)->exists()) {
            abort(403, 'You do not have access to this project\'s chat room.');
        }
    }

    /**
     * Get the latest 50 messages from the project chat room.
     */
    public function index(Project $project): JsonResponse
    {
        $this->authorizeProjectAccess($project);

        $messages = $project->messages()
            ->with('user:id,name,email')
            ->latest()
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    /**
     * Store a new chat message in the project chat room.
     */
    public function store(Project $project, Request $request): JsonResponse
    {
        $this->authorizeProjectAccess($project);

        $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $message = $project->messages()->create([
            'user_id' => auth()->id(),
            'message' => $request->message,
        ]);

        $message->load('user:id,name,email');

        return response()->json([
            'success' => true,
            'message' => $message,
        ], 201);
    }
}
