<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Module;
use App\Models\Enrollment;
use App\Services\EnrollmentService;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentServiceTest extends TestCase
{
    use RefreshDatabase;

    private EnrollmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new EnrollmentService();
    }

    /**
     * Test enroll student in module creates enrollment
     */
    public function test_enroll_student_creates_enrollment(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create(['is_active' => true]);

        $enrollment = $this->service->enrollStudent($student, $module);

        $this->assertNotNull($enrollment->id);
        $this->assertEquals($student->id, $enrollment->user_id);
        $this->assertEquals($module->id, $enrollment->module_id);
        $this->assertEquals('IN_PROGRESS', $enrollment->status);
    }

    /**
     * Test cannot enroll in inactive module
     */
    public function test_cannot_enroll_in_inactive_module(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create(['is_active' => false]);

        $this->expectException(ValidationException::class);
        $this->service->enrollStudent($student, $module);
    }

    /**
     * Test cannot enroll twice in same module
     */
    public function test_cannot_enroll_twice_in_same_module(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();

        $this->service->enrollStudent($student, $module);

        $this->expectException(ValidationException::class);
        $this->service->enrollStudent($student, $module);
    }

    /**
     * Test cannot exceed max enrollments
     */
    public function test_cannot_exceed_max_enrollments(): void
    {
        $student = User::factory()->create();
        $modules = Module::factory(4)->create(['is_active' => true]);

        foreach ($modules as $module) {
            $this->service->enrollStudent($student, $module);
        }

        $fifthModule = Module::factory()->create();
        $this->expectException(ValidationException::class);
        $this->service->enrollStudent($student, $fifthModule);
    }

    /**
     * Test module cannot exceed max students
     */
    public function test_module_cannot_exceed_max_students(): void
    {
        $module = Module::factory()->create();
        $students = User::factory(10)->create(['role' => 'STUDENT']);

        foreach ($students as $student) {
            $this->service->enrollStudent($student, $module);
        }

        $eleventhStudent = User::factory()->create();
        $this->expectException(ValidationException::class);
        $this->service->enrollStudent($eleventhStudent, $module);
    }

    /**
     * Test get active enrollments
     */
    public function test_get_active_enrollments(): void
    {
        $student = User::factory()->create();
        $modules = Module::factory(3)->create();

        foreach ($modules as $module) {
            Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        $enrollments = $this->service->getActiveEnrollments($student);
        $this->assertCount(3, $enrollments);
    }

    /**
     * Test get completed enrollments
     */
    public function test_get_completed_enrollments(): void
    {
        $student = User::factory()->create();
        $modules = Module::factory(2)->create();

        Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[0]->id,
            'status' => 'PASS',
        ]);

        Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $modules[1]->id,
            'status' => 'FAIL',
        ]);

        $completed = $this->service->getCompletedEnrollments($student);
        $this->assertCount(2, $completed);
    }

    /**
     * Test complete enrollment with PASS status
     */
    public function test_complete_enrollment_with_pass(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $completed = $this->service->completeEnrollment($enrollment, 'PASS');

        $this->assertEquals('PASS', $completed->status);
        $this->assertNotNull($completed->completion_date);
    }

    /**
     * Test complete enrollment with FAIL status
     */
    public function test_complete_enrollment_with_fail(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $completed = $this->service->completeEnrollment($enrollment, 'FAIL');

        $this->assertEquals('FAIL', $completed->status);
        $this->assertNotNull($completed->completion_date);
    }

    /**
     * Test invalid completion status
     */
    public function test_invalid_completion_status(): void
    {
        $enrollment = Enrollment::factory()->create();

        $this->expectException(ValidationException::class);
        $this->service->completeEnrollment($enrollment, 'INVALID');
    }

    /**
     * Test get all active enrollments in system
     */
    public function test_get_all_active_enrollments(): void
    {
        $student1 = User::factory()->create();
        $student2 = User::factory()->create();
        $module = Module::factory()->create();

        Enrollment::create([
            'user_id' => $student1->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        Enrollment::create([
            'user_id' => $student2->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollments = $this->service->getAllActiveEnrollments();
        $this->assertCount(2, $enrollments);
    }
}
