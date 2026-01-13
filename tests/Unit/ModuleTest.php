<?php

namespace Tests\Unit;

use App\Models\Module;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test module can have a teacher
     */
    public function test_module_belongs_to_teacher(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => $teacher->id]);

        $this->assertEquals($teacher->id, $module->teacher->id);
        $this->assertEquals('TEACHER', $module->teacher->role);
    }

    /**
     * Test module can have many enrollments
     */
    public function test_module_has_many_enrollments(): void
    {
        $module = Module::factory()->create();
        $students = User::factory(5)->create(['role' => 'STUDENT']);

        foreach ($students as $student) {
            Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        $this->assertCount(5, $module->enrollments);
    }

    /**
     * Test module is created with correct attributes
     */
    public function test_module_has_required_attributes(): void
    {
        $module = Module::factory()->create([
            'name' => 'Advanced PHP',
            'description' => 'Learn advanced PHP concepts',
            'is_active' => true,
        ]);

        $this->assertEquals('Advanced PHP', $module->name);
        $this->assertEquals('Learn advanced PHP concepts', $module->description);
        $this->assertTrue($module->is_active);
    }

    /**
     * Test module can be activated and deactivated
     */
    public function test_module_active_status_toggle(): void
    {
        $module = Module::factory()->create(['is_active' => true]);
        $this->assertTrue($module->is_active);

        $module->update(['is_active' => false]);
        $this->assertFalse($module->fresh()->is_active);

        $module->update(['is_active' => true]);
        $this->assertTrue($module->fresh()->is_active);
    }

    /**
     * Test module without teacher shows as unassigned
     */
    public function test_module_can_exist_without_teacher(): void
    {
        $module = Module::factory()->create(['teacher_id' => null]);
        $this->assertNull($module->teacher_id);
        $this->assertNull($module->teacher);
    }

    /**
     * Test module teacher can be assigned and changed
     */
    public function test_module_teacher_can_be_assigned(): void
    {
        $teacher1 = User::factory()->create(['role' => 'TEACHER']);
        $teacher2 = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create(['teacher_id' => null]);

        // Assign first teacher
        $module->update(['teacher_id' => $teacher1->id]);
        $this->assertEquals($teacher1->id, $module->fresh()->teacher_id);

        // Change to second teacher
        $module->update(['teacher_id' => $teacher2->id]);
        $this->assertEquals($teacher2->id, $module->fresh()->teacher_id);
    }

    /**
     * Test module counts active enrollments
     */
    public function test_module_enrollment_count(): void
    {
        $module = Module::factory()->create();
        $students = User::factory(3)->create(['role' => 'STUDENT']);

        foreach ($students as $student) {
            Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        // Add one completed enrollment
        $student4 = User::factory()->create(['role' => 'STUDENT']);
        Enrollment::create([
            'user_id' => $student4->id,
            'module_id' => $module->id,
            'status' => 'PASS',
        ]);

        $this->assertEquals(4, $module->enrollments()->count());
        $this->assertEquals(3, $module->enrollments()->where('status', 'IN_PROGRESS')->count());
    }

    /**
     * Test module fillable attributes
     */
    public function test_module_fillable_attributes(): void
    {
        $module = Module::create([
            'name' => 'Test Module',
            'description' => 'Test Description',
            'is_active' => true,
            'teacher_id' => null,
        ]);

        $this->assertNotNull($module->id);
        $this->assertEquals('Test Module', $module->name);
        $this->assertEquals('Test Description', $module->description);
        $this->assertTrue($module->is_active);
    }

    /**
     * Test module timestamps are recorded
     */
    public function test_module_timestamps_are_set(): void
    {
        $module = Module::factory()->create();

        $this->assertNotNull($module->created_at);
        $this->assertNotNull($module->updated_at);
    }
}
