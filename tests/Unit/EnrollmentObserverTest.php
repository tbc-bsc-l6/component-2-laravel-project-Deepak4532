<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Module;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentObserverTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test observer converts student to OLD_STUDENT when all pass
     */
    public function test_observer_converts_student_to_old_student(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Complete the enrollment
        $enrollment->update(['status' => 'PASS']);

        // Verify student became OLD_STUDENT
        $this->assertEquals('OLD_STUDENT', $student->fresh()->role);
    }

    /**
     * Test observer keeps student when enrollment fails
     */
    public function test_observer_keeps_student_on_fail(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Fail the enrollment
        $enrollment->update(['status' => 'FAIL']);

        // Verify student remained STUDENT
        $this->assertEquals('STUDENT', $student->fresh()->role);
    }

    /**
     * Test observer with multiple enrollments
     */
    public function test_observer_with_multiple_enrollments(): void
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

        // Complete first enrollment
        $enrollment1->update(['status' => 'PASS']);
        $this->assertEquals('STUDENT', $student->fresh()->role);

        // Complete second enrollment
        $enrollment2->update(['status' => 'PASS']);
        $this->assertEquals('OLD_STUDENT', $student->fresh()->role);
    }

    /**
     * Test observer doesn't affect already OLD_STUDENT
     */
    public function test_observer_doesnt_affect_old_student(): void
    {
        $student = User::factory()->create(['role' => 'OLD_STUDENT']);
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Update enrollment
        $enrollment->update(['status' => 'PASS']);

        // Verify student remained OLD_STUDENT
        $this->assertEquals('OLD_STUDENT', $student->fresh()->role);
    }

    /**
     * Test observer with mixed pass and fail
     */
    public function test_observer_with_mixed_results(): void
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

        // Pass first, fail second
        $enrollment1->update(['status' => 'PASS']);
        $enrollment2->update(['status' => 'FAIL']);

        // Verify student remained STUDENT
        $this->assertEquals('STUDENT', $student->fresh()->role);
    }

    /**
     * Test observer only checks IN_PROGRESS enrollments
     */
    public function test_observer_only_checks_in_progress(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(2)->create();

        // Create one completed enrollment
        Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[0]->id,
            'status' => 'PASS',
        ]);

        // Create one in-progress enrollment
        $enrollment2 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[1]->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Complete second enrollment
        $enrollment2->update(['status' => 'PASS']);

        // Should still be STUDENT because all enrollments are passed but they were added sequentially
        // Actually, after update - enrollment has 2 records, both PASS
        $this->assertEquals('OLD_STUDENT', $student->fresh()->role);
    }

    /**
     * Test observer handles teacher role
     */
    public function test_observer_doesnt_affect_teacher(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $teacher->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Update enrollment
        $enrollment->update(['status' => 'PASS']);

        // Verify teacher remained TEACHER
        $this->assertEquals('TEACHER', $teacher->fresh()->role);
    }

    /**
     * Test observer handles admin role
     */
    public function test_observer_doesnt_affect_admin(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $admin->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        // Update enrollment
        $enrollment->update(['status' => 'PASS']);

        // Verify admin remained ADMIN
        $this->assertEquals('ADMIN', $admin->fresh()->role);
    }
}
