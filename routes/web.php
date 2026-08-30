<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectChatController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RolePermissionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::post('/projects/{project}/members', [ProjectController::class, 'storeMember'])->name('projects.members.store');
    Route::delete('/projects/{project}/members/{member}', [ProjectController::class, 'removeMember'])->name('projects.members.remove');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');

    Route::post('/tasks/{task}/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('tasks.comments.store');
    Route::delete('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    
    Route::post('/tasks/{task}/attachments', [App\Http\Controllers\AttachmentController::class, 'store'])->name('tasks.attachments.store');
    Route::delete('/attachments/{attachment}', [App\Http\Controllers\AttachmentController::class, 'destroy'])->name('attachments.destroy');

    Route::get('/projects/{project}/kanban', [TaskController::class, 'kanban'])->name('projects.kanban');
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/projects/{project}/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::patch('/projects/{project}/tasks/reorder', [App\Http\Controllers\TaskController::class, 'reorder'])->name('tasks.reorder');
    Route::post('/projects/{project}/tasks', [App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
    Route::post('/projects/{project}/tasks/{task}/subtasks', [App\Http\Controllers\TaskController::class, 'createSubtask'])->name('tasks.subtasks.store');
    Route::put('/projects/{project}/tasks/{task}', [App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/projects/{project}/tasks/{task}', [App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');

    // Task Labels
    Route::post('/tasks/{task}/labels', [App\Http\Controllers\TaskController::class, 'syncLabels'])->name('tasks.labels.sync');

    // Task Dependencies
    Route::post('/tasks/{task}/dependencies', [App\Http\Controllers\TaskController::class, 'addDependency'])->name('tasks.dependencies.store');
    Route::delete('/tasks/{task}/dependencies/{dependency}', [App\Http\Controllers\TaskController::class, 'removeDependency'])->name('tasks.dependencies.destroy');

    Route::get('/projects/{project}/chat/messages', [ProjectChatController::class, 'index'])->name('projects.chat.messages');
    Route::post('/projects/{project}/chat/messages', [ProjectChatController::class, 'store'])->name('projects.chat.store');

    Route::resource('users', UserController::class)->except(['show']);
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    // Dynamic Projects routes check for cross-branch compatibility
    if (class_exists('App\Http\Controllers\ProjectController')) {
        Route::get('/projects', [\App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
        Route::post('/projects', [\App\Http\Controllers\ProjectController::class, 'store'])->name('projects.store');
        Route::get('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
        Route::put('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
        Route::delete('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'destroy'])->name('projects.destroy');
        Route::post('/projects/{project}/members', [\App\Http\Controllers\ProjectController::class, 'addMember'])->name('projects.members.add');
        Route::delete('/projects/{project}/members/{member}', [\App\Http\Controllers\ProjectController::class, 'removeMember'])->name('projects.members.remove');
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

    // Task Kanban & Reorder routes
    if (class_exists('App\Http\Controllers\TaskController')) {
        Route::get('/projects/{project}/kanban', [\App\Http\Controllers\TaskController::class, 'kanban'])->name('projects.kanban');
        Route::patch('/projects/{project}/tasks/reorder', [\App\Http\Controllers\TaskController::class, 'reorder'])->name('tasks.reorder');
    }

    // Project Chat routes
    if (class_exists('App\Http\Controllers\ProjectChatController')) {
        Route::get('/projects/{project}/chat/messages', [\App\Http\Controllers\ProjectChatController::class, 'index'])->name('projects.chat.messages');
        Route::post('/projects/{project}/chat/messages', [\App\Http\Controllers\ProjectChatController::class, 'store'])->name('projects.chat.store');
    }
});

require __DIR__ . '/auth.php';
