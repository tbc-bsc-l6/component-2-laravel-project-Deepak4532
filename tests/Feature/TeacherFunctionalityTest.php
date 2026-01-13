<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Module;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherFunctionalityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test teacher can view enrolled students
     */
    public function test_teacher_can_view_enrolled_students(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher->id]);
        $students = User::factory(3)->create(['role' => 'STUDENT']);

        foreach ($students as $student) {
            Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        $response = $this->actingAs($teacher)
            ->getJson("/api/teacher/modules/{$module->id}/students");

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'enrollments');
    }

    /**
     * Test teacher cannot view another teacher's students
     */
    public function test_teacher_cannot_view_other_teacher_students(): void
    {
        $teacher1 = User::factory()->create(['role' => 'TEACHER']);
        $teacher2 = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher2->id]);

        $response = $this->actingAs($teacher1)
            ->getJson("/api/teacher/modules/{$module->id}/students");

        $response->assertStatus(403);
    }

    /**
     * Test teacher can update student enrollment status
     */
    public function test_teacher_can_update_student_status(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher->id]);
        $student = User::factory()->create(['role' => 'STUDENT']);

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $response = $this->actingAs($teacher)
            ->patchJson('/api/teacher/enrollments/status', [
                'enrollment_id' => $enrollment->id,
                'status' => 'PASS',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'PASS',
        ]);
    }

    /**
     * Test teacher cannot update enrollment they don't teach
     */
    public function test_teacher_cannot_update_other_teacher_enrollment(): void
    {
        $teacher1 = User::factory()->create(['role' => 'TEACHER']);
        $teacher2 = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher2->id]);
        $student = User::factory()->create(['role' => 'STUDENT']);

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $response = $this->actingAs($teacher1)
            ->patchJson('/api/teacher/enrollments/status', [
                'enrollment_id' => $enrollment->id,
                'status' => 'PASS',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test teacher can only set valid status values
     */
    public function test_teacher_can_only_set_valid_enrollment_status(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher->id]);
        $student = User::factory()->create(['role' => 'STUDENT']);

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $response = $this->actingAs($teacher)
            ->patchJson('/api/teacher/enrollments/status', [
                'enrollment_id' => $enrollment->id,
                'status' => 'INVALID_STATUS',
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test teacher receives completion_date when marking student as completed
     */
    public function test_teacher_update_sets_completion_date(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher->id]);
        $student = User::factory()->create(['role' => 'STUDENT']);

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->actingAs($teacher)
            ->patchJson('/api/teacher/enrollments/status', [
                'enrollment_id' => $enrollment->id,
                'status' => 'PASS',
            ]);

        $updatedEnrollment = $enrollment->fresh();
        $this->assertNotNull($updatedEnrollment->completion_date);
        $this->assertEquals('PASS', $updatedEnrollment->status);
    }

    /**
     * Test teacher's students list includes completion status
     */
    public function test_teacher_students_list_shows_completion_status(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher->id]);
        $students = User::factory(2)->create(['role' => 'STUDENT']);

        $enrollment1 = Enrollment::create([
            'user_id' => $students[0]->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment2 = Enrollment::create([
            'user_id' => $students[1]->id,
            'module_id' => $module->id,
            'status' => 'PASS',
        ]);

        $response = $this->actingAs($teacher)
            ->getJson("/api/teacher/modules/{$module->id}/students");

        $response->assertStatus(200);
        
        $enrollments = $response->json('enrollments');
        $this->assertCount(2, $enrollments);
    }
}
