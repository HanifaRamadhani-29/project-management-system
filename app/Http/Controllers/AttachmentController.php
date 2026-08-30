<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function store(Request $request, Task $task)
    {
<<<<<<< HEAD
        $user = $request->user();
        if ($user->role !== 'super_admin' && !$user->can('files.upload')) {
            abort(403, 'Unauthorized action. You do not have permission to upload files.');
        }

=======
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
        $this->authorize('update', $task);

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        $path = $file->store('attachments', 'public');

        $task->attachments()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return back()->with('success', 'File attached.');
    }

<<<<<<< HEAD
    public function download(Request $request, Attachment $attachment)
    {
        $user = $request->user();
        if ($user->role !== 'super_admin' && !$user->can('files.download')) {
            abort(403, 'Unauthorized action. You do not have permission to download files.');
        }

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->file_name);
    }

    public function destroy(Attachment $attachment)
    {
        $user = auth()->user();
        if (!$user) {
            abort(403, 'Unauthenticated.');
        }

        $project = $attachment->task->project;
        $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('Super Admin');
        $isProjectPM = $project->manager_id === $user->id || $project->members()->where('user_id', $user->id)->whereIn('project_user.role', ['Project Manager', 'project_manager'])->exists();

        if (!$isSuperAdmin && !$isProjectPM && !$user->can('update', $attachment->task)) {
            abort(403, 'Unauthorized action. Only authorized users can delete attachments.');
        }
=======
    public function destroy(Attachment $attachment)
    {
        $this->authorize('update', $attachment->task);
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b

        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

<<<<<<< HEAD
        // Log the audit event
        app(\App\Services\AuditLogService::class)->log(
            'ATTACHMENT_DELETED',
            $attachment,
            ['file_name' => $attachment->file_name],
            null
        );

        $attachment->delete();

        return back()->with('success', 'File deleted');
=======
        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    }
}
