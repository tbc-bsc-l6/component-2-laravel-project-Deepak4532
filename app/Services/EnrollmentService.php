<?php

namespace App\Services;

use App\Models\User;
use App\Models\Module;
use App\Models\Enrollment;
use Illuminate\Validation\ValidationException;

class EnrollmentService
{
    /**
     * Maximum number of active enrollments per student.
     */
    private const MAX_ENROLLMENTS_PER_STUDENT = 4;

    /**
     * Maximum number of active students per module.
     */
    private const MAX_STUDENTS_PER_MODULE = 10;

    /**
     * Enroll a student in a module with business rule validation.
     *
     * @param User $student
     * @param Module $module
     * @return Enrollment
     * @throws ValidationException
     */
    public function enrollStudent(User $student, Module $module): Enrollment
    {
        // Rule 1: Check if module is active
        if (!$module->is_active) {
            throw ValidationException::withMessages([
                'module' => 'This module is archived and cannot accept new enrollments.',
            ]);
        }

        // Rule 2: Check if student already enrolled in this module
        $existingEnrollment = Enrollment::where('user_id', $student->id)
            ->where('module_id', $module->id)
            ->first();

        if ($existingEnrollment) {
            throw ValidationException::withMessages([
                'enrollment' => 'Student is already enrolled in this module.',
            ]);
        }

        // Rule 3: Check if student has 4 active enrollments
        $activeEnrollmentsCount = Enrollment::where('user_id', $student->id)
            ->where('status', 'IN_PROGRESS')
            ->count();

        if ($activeEnrollmentsCount >= self::MAX_ENROLLMENTS_PER_STUDENT) {
            throw ValidationException::withMessages([
                'student' => "Student has reached the maximum limit of " . self::MAX_ENROLLMENTS_PER_STUDENT . " active enrollments.",
            ]);
        }

        // Rule 4: Check if module has 10 active students
        $activeStudentsCount = Enrollment::where('module_id', $module->id)
            ->where('status', 'IN_PROGRESS')
            ->distinct('user_id')
            ->count();

        if ($activeStudentsCount >= self::MAX_STUDENTS_PER_MODULE) {
            throw ValidationException::withMessages([
                'module' => 'This module has reached the maximum capacity of ' . self::MAX_STUDENTS_PER_MODULE . ' active students.',
            ]);
        }

        // All rules passed, create enrollment
        return Enrollment::create([
            'user_id' => $student->id,
            'module_id' => $module->id,
            'status' => 'IN_PROGRESS',
            'start_date' => now(),
        ]);
    }

    /**
     * Complete an enrollment with a given status.
     *
     * @param Enrollment $enrollment
     * @param string $status
     * @return Enrollment
     */
    public function completeEnrollment(Enrollment $enrollment, string $status = 'PASS'): Enrollment
    {
        if (!in_array($status, ['PASS', 'FAIL'])) {
            throw ValidationException::withMessages([
                'status' => 'Status must be either PASS or FAIL.',
            ]);
        }

        $enrollment->markCompleted($status);
        return $enrollment;
    }

    /**
     * Get active enrollments for a student.
     *
     * @param User $student
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveEnrollments(User $student)
    {
        return $student->enrollments()
            ->where('status', 'IN_PROGRESS')
            ->get();
    }

    /**
     * Get completed enrollments for a student.
     *
     * @param User $student
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getCompletedEnrollments(User $student)
    {
        return $student->enrollments()
            ->whereIn('status', ['PASS', 'FAIL'])
            ->get();
    }

    /**
     * Get all active enrollments in the system.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllActiveEnrollments()
    {
        return Enrollment::where('status', 'IN_PROGRESS')
            ->with('student', 'module')
            ->get();
    }

    /**
     * Get active students for a module.
     *
     * @param Module $module
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveStudents(Module $module)
    {
        return $module->enrollments()
            ->where('status', 'IN_PROGRESS')
            ->with('student')
            ->get();
    }
}
