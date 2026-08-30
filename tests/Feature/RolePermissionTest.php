<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $member;

    protected function setUp(): void
    {
        parent::setUp();

        // Run seeders to set up roles and permissions
        $this->seed(\Database\Seeders\PermissionSeeder::class);

        // Create users using seeded roles
        $this->admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => 'super_admin',
        ]);
        $this->admin->assignRole('Super Admin');

        $this->member = User::factory()->create([
            'name' => 'Member User',
            'email' => 'member@example.com',
            'role' => 'member',
        ]);
        $this->member->assignRole('Member');
    }

    /**
     * Test non-admin gets 403 on matrix page.
     */
    public function test_non_admin_cannot_access_roles_permissions_index(): void
    {
        $response = $this->actingAs($this->member)->get(route('roles.permissions.index'));
        $response->assertStatus(403);
    }

    /**
     * Test admin can access matrix page.
     */
    public function test_admin_can_access_roles_permissions_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('roles.permissions.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Roles/Permissions')
            ->has('roles')
            ->has('permissions_grouped')
        );
    }

    /**
     * Test admin can update permissions matrix.
     */
    public function test_admin_can_update_roles_permissions_matrix(): void
    {
        // Member role originally has tasks.change_status, comments.create, files.upload, files.download
        $memberRole = Role::findByName('Member');
        $this->assertTrue($memberRole->hasPermissionTo('tasks.change_status'));
        $this->assertFalse($memberRole->hasPermissionTo('projects.create'));

        // Update matrix to add projects.create to Member and remove tasks.change_status
        $response = $this->actingAs($this->admin)->post(route('roles.permissions.update'), [
            'matrix' => [
                'Member' => ['projects.create', 'comments.create', 'files.upload', 'files.download'],
                'Viewer' => ['files.download'],
                'Project Manager' => ['tasks.change_status'],
            ]
        ]);

        $response->assertRedirect(route('roles.permissions.index'));
        
        // Assert updated permissions
        $this->assertTrue($memberRole->fresh()->hasPermissionTo('projects.create'));
        $this->assertFalse($memberRole->fresh()->hasPermissionTo('tasks.change_status'));
    }

    /**
     * Test Super Admin role is protected from matrix edits.
     */
    public function test_super_admin_role_permissions_are_protected(): void
    {
        $superAdminRole = Role::findByName('Super Admin');
        $totalPermissionsCount = Permission::count();
        $this->assertEquals($totalPermissionsCount, $superAdminRole->permissions()->count());

        // Try to update Super Admin to have zero permissions
        $response = $this->actingAs($this->admin)->post(route('roles.permissions.update'), [
            'matrix' => [
                'Super Admin' => [], // attempt demotion
                'Member' => [],
            ]
        ]);

        // Assert Super Admin permissions are preserved/untouched
        $this->assertEquals($totalPermissionsCount, $superAdminRole->fresh()->permissions()->count());
    }
}
