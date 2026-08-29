<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthAndAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * test_user_can_login_with_correct_credentials
     */
    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt($password = 'secret-password'),
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => $password,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * test_login_rate_limiting_blocks_after_too_many_attempts
     */
    public function test_login_rate_limiting_blocks_after_too_many_attempts(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('correct-password'),
        ]);

        // Trigger 5 failed login attempts
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
            ]);
        }

        // The 6th attempt should be blocked and return throttling message
        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('email');
        $errors = session('errors')->get('email');
        $this->assertStringContainsString('Too many login attempts. Please try again in', $errors[0]);
        $this->assertStringContainsString('seconds.', $errors[0]);
    }

    /**
     * test_user_cannot_access_other_users_project_returns_403_idor_protection
     */
    public function test_user_cannot_access_other_users_project_returns_403_idor_protection(): void
    {
        $userA = User::factory()->create(['role' => 'member']);
        $userB = User::factory()->create(['role' => 'member']);

        // Project belongs to userB (as PM, or userA is not a member)
        $project = Project::create([
            'name' => 'Project B',
            'slug' => 'project-b',
            'status' => 'active',
            'manager_id' => $userB->id,
        ]);

        // userA tries to access Project B
        $response = $this->actingAs($userA)
            ->get(route('projects.show', $project->slug));

        $response->assertStatus(403);
    }

    /**
     * test_unauthenticated_user_redirected_to_login
     */
    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $project = Project::create([
            'name' => 'Project X',
            'slug' => 'project-x',
            'status' => 'active',
        ]);

        $response = $this->get(route('projects.show', $project->slug));

        $response->assertRedirect('/login');
    }

    /**
     * test_super_admin_can_access_any_project
     */
    public function test_super_admin_can_access_any_project(): void
    {
        $admin = User::factory()->create(['role' => 'super_admin']);
        $pm = User::factory()->create(['role' => 'project_manager']);

        $project = Project::create([
            'name' => 'PM Project',
            'slug' => 'pm-project',
            'status' => 'active',
            'manager_id' => $pm->id,
        ]);

        // Super Admin should be able to view, update, delete
        $response = $this->actingAs($admin)
            ->get(route('projects.show', $project->slug));

        $response->assertStatus(200);

        $response = $this->actingAs($admin)
            ->put(route('projects.update', $project->slug), [
                'name' => 'Updated by Admin',
                'status' => 'active',
            ]);

        $response->assertStatus(302); // Redirect back
        $this->assertEquals('Updated by Admin', $project->fresh()->name);

        $response = $this->actingAs($admin)
            ->delete(route('projects.destroy', $project->slug));

        $response->assertRedirect('/dashboard');
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }
}
