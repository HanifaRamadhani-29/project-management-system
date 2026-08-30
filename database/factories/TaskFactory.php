<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'parent_id' => null,
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['backlog', 'todo', 'in_progress', 'review', 'done']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'reporter_id' => User::factory(),
            'assignee_id' => User::factory(),
            'deadline' => now()->addDays(14)->format('Y-m-d'),
            'order' => 0,
        ];
    }
}
