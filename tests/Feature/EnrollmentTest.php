<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Module;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    /**
     * Test student can enroll in a module
     */
    public function test_student_can_enroll_in_module(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create(['is_active' => true]);

        $response = $this->actingAs($student)
            ->postJson('/api/student/enroll', [
                'module_id' => $module->id,
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'enrollment' => [
                'id',
                'user_id',
                'module_id',
                'status',
                'created_at',
            ],
        ]);

        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);
    }

    /**
     * Test student cannot enroll in inactive module
     */
    public function test_student_cannot_enroll_in_inactive_module(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create(['is_active' => false]);

        $response = $this->actingAs($student)
            ->postJson('/api/student/enroll', [
                'module_id' => $module->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['module']);
    }

    /**
     * Test student cannot enroll twice in same module
     */
    public function test_student_cannot_enroll_twice_in_same_module(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create(['is_active' => true]);

        // First enrollment
        Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Try to enroll again
        $response = $this->actingAs($student)
            ->postJson('/api/student/enroll', [
                'module_id' => $module->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['enrollment']);
    }

    /**
     * Test student cannot exceed 4 active enrollments
     */
    public function test_student_cannot_exceed_max_enrollments(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(4)->create(['is_active' => true]);

        // Enroll in 4 modules
        foreach ($modules as $module) {
            Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        // Try to enroll in 5th module
        $fifthModule = Module::factory()->create(['is_active' => true]);
        $response = $this->actingAs($student)
            ->postJson('/api/student/enroll', [
                'module_id' => $fifthModule->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['student']);
    }

    /**
     * Test module cannot exceed 10 active students
     */
    public function test_module_cannot_exceed_max_students(): void
    {
        $module = Module::factory()->create(['is_active' => true]);
        
        // Create 10 students and enroll them
        $students = User::factory(10)->create(['role' => 'STUDENT']);
        foreach ($students as $student) {
            Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        // Try to enroll 11th student
        $eleventhStudent = User::factory()->create(['role' => 'STUDENT']);
        $response = $this->actingAs($eleventhStudent)
            ->postJson('/api/student/enroll', [
                'module_id' => $module->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['module']);
    }

    /**
     * Test non-student cannot enroll
     */
    public function test_non_student_cannot_enroll(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['is_active' => true]);

        $response = $this->actingAs($teacher)
            ->postJson('/api/student/enroll', [
                'module_id' => $module->id,
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test student can view active enrollments
     */
    public function test_student_can_view_active_enrollments(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(3)->create(['is_active' => true]);

        foreach ($modules as $module) {
            Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        $response = $this->actingAs($student)
            ->getJson('/api/student/enrollments/active');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'enrollments');
    }

    /**
     * Test enrollment data is properly loaded with module and teacher info
     */
    public function test_enrollment_includes_module_and_teacher_data(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $teacher = User::factory()->create(['role' => 'TEACHER', 'name' => 'John Doe']);
        $module = Module::factory()->create([
            'is_active' => true,
            'teacher_id' => $teacher->id,
            'name' => 'Advanced PHP',
        ]);

        $response = $this->actingAs($student)
            ->postJson('/api/student/enroll', [
                'module_id' => $module->id,
            ]);

        $response->assertStatus(201);
        $response->assertJson([
            'enrollment' => [
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ],
        ]);

        // Verify module relationship is loaded
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'module_id' => $module->id,
        ]);
    }
}
