<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;

class ProjectService
{
    public function getAllProjects($user)
    {
        if ($user->hasRole('Super Admin')) {
            return Project::latest()->get();
        }

        return $user->projects()->latest()->get();
    }

    public function createProject(array $data, $user): Project
    {
        return DB::transaction(function () use ($data, $user) {
            $baseSlug = Str::slug($data['name']);
            $slug = $baseSlug;
            $counter = 1;

            while (Project::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $data['slug'] = $slug;

            if (!$user->hasRole('Super Admin')) {
                $data['manager_id'] = $user->id;
            }

            $project = Project::create($data);

            // Jika yang membuat bukan Super Admin, jadikan dia Project Manager
            if (!$user->hasRole('Super Admin')) {
                $project->members()->attach($user->id, ['role' => 'Project Manager']);
            }

            // Catat log
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'CREATED',
                'entity_type' => 'Project',
                'entity_id' => $project->id,
                'new_value' => $project->toArray(),
            ]);

            return $project;
        });
    }

    public function updateProject(Project $project, array $data, $user): Project
    {
        return DB::transaction(function () use ($project, $data, $user) {
            if (isset($data['name']) && $data['name'] !== $project->name) {
                $baseSlug = Str::slug($data['name']);
                $slug = $baseSlug;
                $counter = 1;

                while (Project::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                    $slug = $baseSlug . '-' . $counter;
                    $counter++;
                }

                $data['slug'] = $slug;
            }

            if (isset($data['status'])) {
                $data['status'] = strtolower((string) $data['status']);
            }

            $oldValue = $project->toArray();
            
            $project->update($data);

            // Catat log
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'UPDATED',
                'entity_type' => 'Project',
                'entity_id' => $project->id,
                'old_value' => $oldValue,
                'new_value' => $project->fresh()->toArray(),
            ]);

            return $project;
        });
    }

    public function addMember(int $projectId, int $userId, string $role): void
    {
        $project = Project::findOrFail($projectId);

        if ($project->members()->where('user_id', $userId)->exists()) {
            throw new \Exception('User ini sudah menjadi anggota di proyek ini');
        }

        $project->members()->attach($userId, ['role' => $role]);
    }

    public function deleteProject(Project $project, $user): void
    {
        DB::transaction(function () use ($project, $user) {
            $oldValue = $project->toArray();
            
            $project->delete();

            // Catat log
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'DELETED',
                'entity_type' => 'Project',
                'entity_id' => $project->id,
                'old_value' => $oldValue,
            ]);
        });
    }
}
