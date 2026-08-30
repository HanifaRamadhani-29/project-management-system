<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\ActivityLog;

class ProjectService
{
    private function normalizeStatus(string $status): string
    {
        $status = strtolower(trim($status));

        $allowed = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];

        if (!in_array($status, $allowed, true)) {
            throw new \InvalidArgumentException('Status project tidak valid. Pilih salah satu: planning, active, on_hold, completed, cancelled.');
        }

        return $status;
    }

    public function getAllProjects($user, array $filters = [])
    {
        $query = $user->hasRole('Super Admin')
            ? Project::query()
            : $user->projects();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate(10)->withQueryString();
    }

    public function createProject(array $data, $user): Project
    {
        return DB::transaction(function () use ($data, $user) {
            if (isset($data['status'])) {
                $data['status'] = $this->normalizeStatus($data['status']);
            }

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

            $managerUserId = (int) ($data['manager_id'] ?? $user->id);

            $project->members()->syncWithoutDetaching([
                $managerUserId => ['role' => 'Project Manager'],
                $user->id => ['role' => $user->hasRole('Super Admin') ? 'Super Admin' : 'Project Manager'],
            ]);

            if (!empty($data['manager_id'])) {
                $project->manager_id = (int) $data['manager_id'];
                $project->save();
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
            if (isset($data['status'])) {
                $data['status'] = $this->normalizeStatus($data['status']);
            }

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

    public function removeMember(Project $project, int $userId): void
    {
        $user = auth()->user();

        if (!$user || (!$user->hasRole('Super Admin') && !$project->members()->where('user_id', $user->id)->where('role', 'Project Manager')->exists())) {
            abort(403, 'Hanya Project Manager atau Super Admin yang boleh menghapus member project.');
        }

        if ((int) $project->manager_id === $userId) {
            throw new \Exception('Project manager tidak dapat dihapus dari project.');
        }

        if (!$project->members()->where('users.id', $userId)->exists()) {
            throw new \Exception('User tidak terdaftar sebagai member project ini.');
        }

        $project->members()->detach($userId);
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
