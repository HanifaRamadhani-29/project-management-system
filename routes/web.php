<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\TaskApprovalController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
<<<<<<< HEAD
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
=======
    return redirect()->route('login');
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Dynamic Projects routes check for cross-branch compatibility
    if (class_exists('App\Http\Controllers\ProjectController')) {
        Route::get('/projects', [\App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
        Route::get('/projects/create', [\App\Http\Controllers\ProjectController::class, 'create'])->name('projects.create');
        Route::post('/projects', [\App\Http\Controllers\ProjectController::class, 'store'])->name('projects.store');
        Route::get('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
        Route::get('/projects/{project}/edit', [\App\Http\Controllers\ProjectController::class, 'edit'])->name('projects.edit');
        Route::put('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
        Route::delete('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'destroy'])->name('projects.destroy');
        Route::post('/projects/{project}/members', [\App\Http\Controllers\ProjectController::class, 'addMember'])->name('projects.members.add');
        Route::delete('/projects/{project}/members/{user}', [\App\Http\Controllers\ProjectController::class, 'removeMember'])->name('projects.members.remove');
    } else {
        Route::get('/projects', function () {
            return Inertia::render('Dashboard');
        })->name('projects.index');
    }

    // Super Admin: User Management routes
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');

    // Super Admin: Role & Permission Management routes
    Route::get('/roles/permissions', [RolePermissionController::class, 'index'])->name('roles.permissions.index');
    Route::post('/roles/permissions', [RolePermissionController::class, 'update'])->name('roles.permissions.update');

    // Super Admin: Audit Logs route
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit_logs.index');

    // Task Kanban & Reorder routes
    if (class_exists('App\Http\Controllers\TaskController')) {
        Route::get('/projects/{project}/kanban', [\App\Http\Controllers\TaskController::class, 'kanban'])->name('projects.kanban');
        Route::patch('/projects/{project}/tasks/reorder', [\App\Http\Controllers\TaskController::class, 'reorder'])->name('tasks.reorder');
        
        // Task CRUD & sub-features
        Route::post('/projects/{project}/tasks', [\App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
        Route::put('/projects/{project}/tasks/{task}', [\App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
        Route::delete('/projects/{project}/tasks/{task}', [\App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');
        Route::post('/projects/{project}/tasks/{task}/subtasks', [\App\Http\Controllers\TaskController::class, 'createSubtask'])->name('tasks.subtasks.store');
        Route::post('/tasks/{task}/labels', [\App\Http\Controllers\TaskController::class, 'syncLabels'])->name('tasks.labels.sync');
        Route::post('/tasks/{task}/dependencies', [\App\Http\Controllers\TaskController::class, 'addDependency'])->name('tasks.dependencies.store');
        Route::delete('/tasks/{task}/dependencies/{dependency}', [\App\Http\Controllers\TaskController::class, 'removeDependency'])->name('tasks.dependencies.destroy');
    }

    Route::get('/attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy'])->name('attachments.destroy');

    if (class_exists('App\Http\Controllers\AttachmentController')) {
        Route::post('/tasks/{task}/attachments', [\App\Http\Controllers\AttachmentController::class, 'store'])->name('tasks.attachments.store');
    }

    if (class_exists('App\Http\Controllers\CommentController')) {
        Route::post('/tasks/{task}/comments', [\App\Http\Controllers\CommentController::class, 'store'])->name('tasks.comments.store');
        Route::delete('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    }

    // Project Chat routes
    if (class_exists('App\Http\Controllers\ProjectChatController')) {
        Route::get('/projects/{project}/chat/messages', [\App\Http\Controllers\ProjectChatController::class, 'index'])->name('projects.chat.messages');
        Route::post('/projects/{project}/chat/messages', [\App\Http\Controllers\ProjectChatController::class, 'store'])->name('projects.chat.store');
    }

    // Approval Workflow routes
    Route::post('/tasks/{task}/submit-review', [TaskApprovalController::class, 'submitForReview'])->name('tasks.submit-review');
    Route::post('/tasks/{task}/approve', [TaskApprovalController::class, 'approve'])->name('tasks.approve');
    Route::post('/tasks/{task}/revision', [TaskApprovalController::class, 'requestRevision'])->name('tasks.revision');
    Route::get('/approvals', [TaskApprovalController::class, 'index'])->name('approvals.index');
});

require __DIR__ . '/auth.php';
