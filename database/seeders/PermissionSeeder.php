<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions grouped by module
        $permissions = [
            // Projects Module
            [
                'name' => 'projects.create',
                'module' => 'Projects',
                'description' => 'Allows creating new projects and assigning project managers'
            ],
            [
                'name' => 'projects.edit',
                'module' => 'Projects',
                'description' => 'Allows modifying project details (name, deadline, status)'
            ],
            [
                'name' => 'projects.delete',
                'module' => 'Projects',
                'description' => 'Allows deleting projects permanently from the system'
            ],
            [
                'name' => 'projects.manage_members',
                'module' => 'Projects',
                'description' => 'Allows adding or removing members in a project'
            ],

            // Tasks Module
            [
                'name' => 'tasks.create',
                'module' => 'Tasks',
                'description' => 'Allows creating new tasks within projects'
            ],
            [
                'name' => 'tasks.edit',
                'module' => 'Tasks',
                'description' => 'Allows modifying task details, assignees, and deadlines'
            ],
            [
                'name' => 'tasks.delete',
                'module' => 'Tasks',
                'description' => 'Allows deleting tasks from projects'
            ],
            [
                'name' => 'tasks.change_status',
                'module' => 'Tasks',
                'description' => 'Allows moving tasks between statuses (backlog, todo, in progress, done)'
            ],
            [
                'name' => 'tasks.approve',
                'module' => 'Tasks',
                'description' => 'Allows reviewing and approving tasks in the review state'
            ],

            // Comments & Files Module
            [
                'name' => 'comments.create',
                'module' => 'Comments & Files',
                'description' => 'Allows posting comments on project tasks'
            ],
            [
                'name' => 'files.upload',
                'module' => 'Comments & Files',
                'description' => 'Allows uploading documents and attachments to tasks'
            ],
            [
                'name' => 'files.download',
                'module' => 'Comments & Files',
                'description' => 'Allows downloading project and task attachments'
            ],

            // System Module
            [
                'name' => 'audit_logs.view',
                'module' => 'System',
                'description' => 'Allows viewing system-wide action logs and activity audit trails'
            ],
            [
                'name' => 'users.manage',
                'module' => 'System',
                'description' => 'Allows Super Admin access to add, edit, or delete users and modify roles'
            ],
        ];

        // Create permissions
        foreach ($permissions as $perm) {
            Permission::findOrCreate($perm['name'], 'web');
            
            // Update module and description columns
            DB::table(config('permission.table_names.permissions'))
                ->where('name', $perm['name'])
                ->update([
                    'module' => $perm['module'],
                    'description' => $perm['description']
                ]);
        }

        // Fetch or create roles
        $superAdmin = Role::findOrCreate('Super Admin', 'web');
        $projectManager = Role::findOrCreate('Project Manager', 'web');
        $member = Role::findOrCreate('Member', 'web');
        $viewer = Role::findOrCreate('Viewer', 'web');

        // Sync Super Admin permissions (all)
        $superAdmin->syncPermissions(Permission::all());

        // Sync Project Manager permissions
        $projectManager->syncPermissions([
            'projects.create', 'projects.edit', 'projects.manage_members',
            'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.change_status', 'tasks.approve',
            'comments.create', 'files.upload', 'files.download'
        ]);

        // Sync Member permissions
        $member->syncPermissions([
            'tasks.change_status', 'comments.create', 'files.upload', 'files.download'
        ]);

        // Sync Viewer permissions
        $viewer->syncPermissions([
            'files.download'
        ]);
    }
}
