<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RolePermissionController;
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

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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
});

require __DIR__ . '/auth.php';
