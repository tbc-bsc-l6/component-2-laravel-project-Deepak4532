<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Module;
use App\Models\Enrollment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can have enrollments
     */
    public function test_user_has_many_enrollments(): void
    {
        $user = User::factory()->create(['role' => 'STUDENT']);
        $modules = Module::factory(3)->create();

        foreach ($modules as $module) {
            Enrollment::create([
                'user_id' => $user->id,
                'module_id' => $module->id,
                'status' => 'IN_PROGRESS',
            ]);
        }

        $this->assertCount(3, $user->enrollments);
    }

    /**
     * Test user is created with correct attributes
     */
    public function test_user_has_required_attributes(): void
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role' => 'STUDENT',
        ]);

        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertEquals('STUDENT', $user->role);
    }

    /**
     * Test user password is hashed
     */
    public function test_user_password_is_hashed(): void
    {
        $user = User::factory()->create(['password' => 'password123']);

        $this->assertNotEquals('password123', $user->password);
        $this->assertTrue(password_verify('password123', $user->password));
    }

    /**
     * Test user role can be set to different values
     */
    public function test_user_role_can_be_set(): void
    {
        $user = User::factory()->create(['role' => 'STUDENT']);
        $this->assertEquals('STUDENT', $user->role);

        $user->update(['role' => 'OLD_STUDENT']);
        $this->assertEquals('OLD_STUDENT', $user->role);
    }

    /**
     * Test user filters by role
     */
    public function test_user_can_be_filtered_by_role(): void
    {
        User::factory(3)->create(['role' => 'STUDENT']);
        User::factory(2)->create(['role' => 'TEACHER']);
        User::factory(1)->create(['role' => 'ADMIN']);

        $students = User::where('role', 'STUDENT')->get();
        $teachers = User::where('role', 'TEACHER')->get();

        $this->assertCount(3, $students);
        $this->assertCount(2, $teachers);
    }

    /**
     * Test user email is unique
     */
    public function test_user_email_is_unique(): void
    {
        User::factory()->create(['email' => 'unique@example.com']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        User::factory()->create(['email' => 'unique@example.com']);
    }

    /**
     * Test student can have many enrollments in modules
     */
    public function test_student_enrollment_relationship(): void
    {
        $student = User::factory()->create(['role' => 'STUDENT']);
        $module1 = Module::factory()->create();
        $module2 = Module::factory()->create();

        $enrollment1 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module1->id,
            'status' => 'IN_PROGRESS',
        ]);

        $enrollment2 = Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module2->id,
            'status' => 'PASS',
        ]);

        $enrollments = $student->enrollments;
        $this->assertCount(2, $enrollments);
        $this->assertTrue($enrollments->contains($enrollment1));
        $this->assertTrue($enrollments->contains($enrollment2));
    }
}
