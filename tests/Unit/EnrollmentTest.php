<?php

namespace Tests\Unit;

use App\Models\Enrollment;
use App\Models\User;
use App\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test enrollment belongs to student
     */
    public function test_enrollment_belongs_to_student(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create();
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->assertEquals($student->id, $enrollment->student->id);
        $this->assertEquals($student->id, $enrollment->user->id);
    }

    /**
     * Test enrollment belongs to module
     */
    public function test_enrollment_belongs_to_module(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create(['name' => 'PHP Basics']);
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->assertEquals($module->id, $enrollment->module->id);
        $this->assertEquals('PHP Basics', $enrollment->module->name);
    }

    /**
     * Test enrollment has required attributes
     */
    public function test_enrollment_has_required_attributes(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
            'start_date' => now(),
        ]);

        $this->assertEquals($student->id, $enrollment->user_id);
        $this->assertEquals($module->id, $enrollment->module_id);
        $this->assertEquals('IN_PROGRESS', $enrollment->status);
        $this->assertNotNull($enrollment->start_date);
    }

    /**
     * Test enrollment status can be set to valid values
     */
    public function test_enrollment_status_values(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();

        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->assertEquals('IN_PROGRESS', $enrollment->status);

        $enrollment->update(['status' => 'PASS']);
        $this->assertEquals('PASS', $enrollment->fresh()->status);

        $enrollment->update(['status' => 'FAIL']);
        $this->assertEquals('FAIL', $enrollment->fresh()->status);
    }

    /**
     * Test enrollment completion date can be set
     */
    public function test_enrollment_completion_date(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->assertNull($enrollment->completion_date);

        $enrollment->update([
            'status' => 'PASS',
            'completion_date' => now(),
        ]);

        $this->assertNotNull($enrollment->fresh()->completion_date);
    }

    /**
     * Test enrollment unique constraint on user and module
     */
    public function test_enrollment_unique_user_module_combination(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();

        Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);
        Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
        ]);
    }

    /**
     * Test enrollment date casting
     */
    public function test_enrollment_dates_are_cast(): void
    {
        $student = User::factory()->create();
        $module = Module::factory()->create();
        $now = now();
        $enrollment = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
            'start_date' => $now,
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $enrollment->start_date);
    }

    /**
     * Test enrollment can be deleted
     */
    public function test_enrollment_can_be_deleted(): void
    {
        $enrollment = Enrollment::factory()->create();
        $enrollmentId = $enrollment->id;

        $enrollment->delete();

        $this->assertNull(Enrollment::find($enrollmentId));
    }

    /**
     * Test enrollment fillable attributes
     */
    public function test_enrollment_fillable_attributes(): void
    {
        $data = [
            'user_id' => User::factory()->create()->id,
            'module_id' => Module::factory()->create()->id,
            'status' => 'IN_PROGRESS',
            'start_date' => now(),
            'completion_date' => null,
        ];

        $enrollment = Enrollment::create($data);

        $this->assertNotNull($enrollment->id);
        $this->assertEquals($data['user_id'], $enrollment->user_id);
        $this->assertEquals($data['module_id'], $enrollment->module_id);
        $this->assertEquals($data['status'], $enrollment->status);
    }
}
