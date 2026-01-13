<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\User;
use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => 'STUDENT'])->id,
            'module_id' => Module::factory()->create()->id,
            'status' => 'IN_PROGRESS',
            'start_date' => now(),
            'completion_date' => null,
        ];
    }

    public function passed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'PASS',
            'completion_date' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'FAIL',
            'completion_date' => now(),
        ]);
    }
}
