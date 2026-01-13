<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Module;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin can create module
     */
    public function test_admin_can_create_module(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        $response = $this->actingAs($admin)
            ->post('/admin/modules', [
                'name' => 'Laravel Basics',
                'description' => 'Learn the fundamentals of Laravel',
            ]);

        $response->assertStatus(302); // Redirect on success

        $this->assertDatabaseHas('modules', [
            'name' => 'Laravel Basics',
            'description' => 'Learn the fundamentals of Laravel',
        ]);
    }

    /**
     * Test non-admin cannot create module
     */
    public function test_non_admin_cannot_create_module(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);

        $response = $this->actingAs($student)
            ->post('/admin/modules', [
                'name' => 'Laravel Basics',
                'description' => 'Learn the fundamentals of Laravel',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test admin can assign teacher to module
     */
    public function test_admin_can_assign_teacher_to_module(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $module = Module::factory()->create();

        $response = $this->actingAs($admin)
            ->patch("/admin/modules/{$module->id}/assign-teacher", [
                'teacher_id' => $teacher->id,
            ]);

        $response->assertStatus(302);

        $this->assertDatabaseHas('modules', [
            'id' => $module->id,
            'teacher_id' => $teacher->id,
        ]);
    }

    /**
     * Test module can be marked as active/inactive
     */
    public function test_module_can_toggle_active_status(): void
    {
        $module = Module::factory()->create(['is_active' => true]);

        // Deactivate module directly
        $module->update(['is_active' => false]);

        // Verify module is inactive
        $this->assertFalse($module->fresh()->is_active);
        
        // Reactivate module
        $module->update(['is_active' => true]);
        $this->assertTrue($module->fresh()->is_active);
    }

    /**
     * Test module cannot accept enrollments when inactive
     */
    public function test_inactive_module_cannot_accept_enrollments(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module = Module::factory()->create(['is_active' => false]);

        $response = $this->actingAs($student)
            ->postJson('/api/student/enroll', [
                'module_id' => $module->id,
            ]);

        $response->assertStatus(422);
    }

    /**
     * Test teacher can view their modules
     */
    public function test_teacher_can_view_assigned_modules(): void
    {
        $teacher = User::factory()->create(['role' => 'TEACHER']);
        $modules = Module::factory(3)->create(['teacher_id' => $teacher->id]);

        // Create modules for other teachers
        Module::factory(2)->create();

        $response = $this->actingAs($teacher)
            ->getJson('/api/teacher/modules');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'modules');
    }

    /**
     * Test module shows student count
     */
    public function test_module_shows_correct_student_count(): void
    {
        $module = Module::factory()->create(['is_active' => true]);
        $students = User::factory(5)->create(['role' => 'STUDENT']);

        foreach ($students as $student) {
            \App\Models\Enrollment::create([
                'user_id' => $student->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        $this->assertEquals(5, $module->enrollments()->count());
    }

    /**
     * Test module is created with is_active true by default
     */
    public function test_module_created_with_active_status_by_default(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);

        $this->actingAs($admin)
            ->post('/admin/modules', [
                'name' => 'Python Basics',
                'description' => 'Learn Python fundamentals',
            ]);

        $module = Module::latest()->first();
        $this->assertTrue($module->is_active);
    }
}
