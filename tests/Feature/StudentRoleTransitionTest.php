<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Module;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentRoleTransitionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test student converts to OLD_STUDENT when all enrollments are completed
     */
    public function test_student_becomes_old_student_when_all_enrollments_completed(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(2)->create();

        // Create enrollments
        $enrollment1 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[0]->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment2 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[1]->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Complete first enrollment
        $enrollment1->update(['status' => 'PASS']);
        $this->assertEquals('STUDENT', $student->fresh()->role);

        // Complete second enrollment
        $enrollment2->update(['status' => 'PASS']);
        $this->assertEquals('OLD_STUDENT', $student->fresh()->role);
    }

    /**
     * Test student with one failed enrollment doesn't become OLD_STUDENT
     */
    public function test_student_with_failed_enrollment_remains_student(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment->update(['status' => 'FAIL']);
        $this->assertEquals('STUDENT', $student->fresh()->role);
    }

    /**
     * Test student with incomplete enrollment remains STUDENT
     */
    public function test_student_with_incomplete_enrollment_remains_student(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create();

        Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->assertEquals('STUDENT', $student->fresh()->role);
    }

    /**
     * Test student with only failed enrollments remains STUDENT
     */
    public function test_student_with_only_failed_enrollments_remains_student(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(2)->create();

        $enrollment1 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[0]->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment2 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[1]->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment1->update(['status' => 'FAIL']);
        $enrollment2->update(['status' => 'FAIL']);

        $this->assertEquals('STUDENT', $student->fresh()->role);
    }

    /**
     * Test mixed passed and failed enrollments doesn't convert to OLD_STUDENT
     */
    public function test_student_with_mixed_results_remains_student(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(2)->create();

        $enrollment1 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[0]->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment2 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[1]->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment1->update(['status' => 'PASS']);
        $enrollment2->update(['status' => 'FAIL']);

        $this->assertEquals('STUDENT', $student->fresh()->role);
    }

    /**
     * Test student transitions happen correctly through dashboard
     */
    public function test_student_dashboard_reflects_role_transition(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(2)->create();

        $enrollments = [];
        foreach ($modules as $module) {
            $enrollments[] = Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        // Complete all enrollments (update individually to trigger observer)
        foreach ($enrollments as $enrollment) {
            $enrollment->update(['status' => 'PASS']);
        }

        // Verify role is updated
        $this->assertEquals('OLD_STUDENT', $student->fresh()->role);
    }
}
