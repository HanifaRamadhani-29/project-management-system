<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Task $task)
    {
<<<<<<< HEAD
        $user = $request->user();
        if ($user->role !== 'super_admin' && !$user->can('comments.create')) {
            abort(403, 'Unauthorized action. You do not have permission to post comments.');
        }

=======
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
        $this->authorize('comment', $task);

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $task->comments()->create([
            'content' => $validated['content'],
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Comment added.');
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== auth()->id() && $comment->task->project->manager_id !== auth()->id()) {
            abort(403);
        }

        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }
}
