<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $member;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Spatie roles
        Role::findOrCreate('Super Admin');
        Role::findOrCreate('Member');
        Role::findOrCreate('Project Manager');
        Role::findOrCreate('Viewer');

        // Create default users
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
     * Test non-admin gets 403.
     */
    public function test_non_admin_cannot_access_user_management_index(): void
    {
        $response = $this->actingAs($this->member)->get(route('users.index'));
        $response->assertStatus(403);
    }

    /**
     * Test admin can access user management.
     */
    public function test_admin_can_access_user_management_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('users.index'));
        $response->assertStatus(200);
    }

    /**
     * Test admin can create a user.
     */
    public function test_admin_can_create_new_user(): void
    {
        $response = $this->actingAs($this->admin)->post(route('users.store'), [
            'name' => 'New User',
            'username' => 'newuser',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'project_manager',
        ]);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role' => 'project_manager',
        ]);

        // Assert Spatie role is assigned
        $createdUser = User::where('email', 'newuser@example.com')->first();
        $this->assertTrue($createdUser->hasRole('Project Manager'));
    }

    /**
     * Test admin can update another user.
     */
    public function test_admin_can_update_user_details(): void
    {
        $response = $this->actingAs($this->admin)->put(route('users.update', $this->member->id), [
            'name' => 'Updated Member',
            'username' => 'updatedmember',
            'email' => 'updatedmember@example.com',
            'role' => 'viewer',
        ]);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $this->member->id,
            'name' => 'Updated Member',
            'email' => 'updatedmember@example.com',
            'role' => 'viewer',
        ]);

        $this->assertTrue($this->member->fresh()->hasRole('Viewer'));
    }

    /**
     * Test admin cannot demote themselves.
     */
    public function test_admin_cannot_demote_themselves(): void
    {
        $response = $this->actingAs($this->admin)->put(route('users.update', $this->admin->id), [
            'name' => 'Admin User Updated',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'role' => 'member',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertEquals('super_admin', $this->admin->fresh()->role);
        $this->assertTrue($this->admin->fresh()->hasRole('Super Admin'));
    }

    /**
     * Test admin cannot delete themselves.
     */
    public function test_admin_cannot_delete_themselves(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('users.destroy', $this->admin->id));

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    /**
     * Test admin can delete other users.
     */
    public function test_admin_can_delete_other_users(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('users.destroy', $this->member->id));

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseMissing('users', ['id' => $this->member->id]);
    }

    /**
     * Test admin can reset passwords.
     */
    public function test_admin_can_reset_user_password(): void
    {
        $response = $this->actingAs($this->admin)->post(route('users.reset-password', $this->member->id), [
            'password' => 'newsecretpassword123',
        ]);

        $response->assertRedirect(route('users.index'));
        // KODE BARU:
        $this->assertTrue(\Illuminate\Support\Facades\Auth::attempt([
            'email' => 'member@example.com',
            'password' => 'newsecretpassword123',
        ]));
    }
}
