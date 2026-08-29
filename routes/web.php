<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectChatController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Route Dummy untuk Projects agar navigasi tidak error
    Route::get('/projects', function () {
        return Inertia::render('Dashboard'); // Sementara arahkan ke dashboard dulu
    })->name('projects.index');

    Route::get('/users', function () {
        return Inertia::render('Dashboard');
    })->name('users.index');
    // Route Projects CRUD & Members Management
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::post('/projects/{project}/members', [ProjectController::class, 'storeMember'])->name('projects.members.store');
    Route::delete('/projects/{project}/members/{member}', [ProjectController::class, 'removeMember'])->name('projects.members.remove');

    Route::post('/tasks/{task}/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('tasks.comments.store');
    Route::delete('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    
    Route::post('/tasks/{task}/attachments', [App\Http\Controllers\AttachmentController::class, 'store'])->name('tasks.attachments.store');
    Route::delete('/attachments/{attachment}', [App\Http\Controllers\AttachmentController::class, 'destroy'])->name('attachments.destroy');

    Route::get('/projects/{project}/kanban', [TaskController::class, 'kanban'])->name('projects.kanban');
    Route::patch('/projects/{project}/tasks/reorder', [App\Http\Controllers\TaskController::class, 'reorder'])->name('tasks.reorder');
    Route::post('/projects/{project}/tasks', [App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
    Route::put('/projects/{project}/tasks/{task}', [App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/projects/{project}/tasks/{task}', [App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::get('/projects/{project}/chat/messages', [ProjectChatController::class, 'index'])->name('projects.chat.messages');
    Route::post('/projects/{project}/chat/messages', [ProjectChatController::class, 'store'])->name('projects.chat.store');

    Route::resource('users', UserController::class)->except(['show']);
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
});

require __DIR__ . '/auth.php';
