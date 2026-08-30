<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'status' => $this->faker->randomElement(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
            'description' => $this->faker->sentence(),
            'start_date' => now()->format('Y-m-d'),
            'deadline' => now()->addMonths(2)->format('Y-m-d'),
            'manager_id' => User::factory(),
        ];
    }
}
