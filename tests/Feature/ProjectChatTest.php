<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\ProjectMessage;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectChatTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'Project Manager']);
        Role::firstOrCreate(['name' => 'Member']);
    }

    /**
     * Test authorized member can retrieve project messages and post a new message.
     */
    public function test_project_member_can_fetch_and_post_messages(): void
    {
        $pm = User::factory()->create();
        $pm->assignRole('Project Manager');

        $member = User::factory()->create();
        $member->assignRole('Member');

        $project = Project::factory()->create([
            'manager_id' => $pm->id,
        ]);

        // Attach member
        $project->members()->attach($member->id);

        // Fetch messages (should be empty initially)
        $response = $this->actingAs($member)
            ->getJson(route('projects.chat.messages', $project->slug));

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'messages' => [],
            ]);

        // Send a message
        $response = $this->actingAs($member)
            ->postJson(route('projects.chat.store', $project->slug), [
                'message' => 'Hello team!',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => [
                    'message' => 'Hello team!',
                    'user_id' => $member->id,
                ],
            ]);

        $this->assertDatabaseHas('project_messages', [
            'project_id' => $project->id,
            'user_id' => $member->id,
            'message' => 'Hello team!',
        ]);
    }

    /**
     * Test non-members are forbidden from retrieving or posting chat messages.
     */
    public function test_non_member_cannot_access_project_chat(): void
    {
        $pm = User::factory()->create();
        $pm->assignRole('Project Manager');

        $otherUser = User::factory()->create();
        $otherUser->assignRole('Member');

        $project = Project::factory()->create([
            'manager_id' => $pm->id,
        ]);

        // Try fetching messages (should fail)
        $response = $this->actingAs($otherUser)
            ->getJson(route('projects.chat.messages', $project->slug));

        $response->assertStatus(403);

        // Try sending message (should fail)
        $response = $this->actingAs($otherUser)
            ->postJson(route('projects.chat.store', $project->slug), [
                'message' => 'Spy message',
            ]);

        $response->assertStatus(403);
    }
}
