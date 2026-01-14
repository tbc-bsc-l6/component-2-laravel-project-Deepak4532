<?php

namespace Database\Factories;

use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

class ModuleFactory extends Factory
{
    protected $model = Module::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word() . ' ' . $this->faker->word(),
            'description' => $this->faker->sentence(),
            'teacher_id' => null,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function withTeacher($teacherId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'teacher_id' => $teacherId ?? \App\Models\User::factory()->create(['role' => 'TEACHER'])->id,
        ]);
    }
}
