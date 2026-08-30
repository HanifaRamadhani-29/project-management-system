<?php

namespace App\Providers;

use App\Models\Project;
use App\Models\Task;
use App\Observers\ProjectObserver;
use App\Observers\TaskObserver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (class_exists('App\Models\Project') && class_exists('App\Observers\ProjectObserver')) {
            \App\Models\Project::observe(\App\Observers\ProjectObserver::class);
        }

        if (class_exists('App\Models\Task') && class_exists('App\Observers\TaskObserver')) {
            \App\Models\Task::observe(\App\Observers\TaskObserver::class);
        }
    }
}
