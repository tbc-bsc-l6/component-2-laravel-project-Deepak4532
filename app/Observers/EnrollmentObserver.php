<?php

namespace App\Observers;

use App\Models\Enrollment;

class EnrollmentObserver
{
    /**
     * Handle the Enrollment "created" event.
     */
    public function created(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Handle the Enrollment "updated" event.
     * Auto-convert STUDENT to OLD_STUDENT when all enrollments are completed.
     */
    public function updated(Enrollment $enrollment): void
    {
        $this->checkAndUpdateStudentRole($enrollment);
    }

    /**
     * Handle the Enrollment "deleted" event.
     */
    public function deleted(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Handle the Enrollment "restored" event.
     */
    public function restored(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Handle the Enrollment "force deleted" event.
     */
    public function forceDeleted(Enrollment $enrollment): void
    {
        //
    }

    /**
     * Check if student has any IN_PROGRESS enrollments and update role accordingly.
     */
    private function checkAndUpdateStudentRole(Enrollment $enrollment): void
    {
        $student = $enrollment->student;

        // Only check if student is currently a STUDENT
        if ($student->role !== 'STUDENT') {
            return;
        }

        // Check for any IN_PROGRESS enrollments
        $hasActiveEnrollments = $student->enrollments()
            ->where('status', 'IN_PROGRESS')
            ->exists();

        // If no active enrollments, check if all enrollments are PASS
        if (!$hasActiveEnrollments) {
            $allEnrollments = $student->enrollments()->count();
            $passedEnrollments = $student->enrollments()
                ->where('status', 'PASS')
                ->count();

            // Only convert to OLD_STUDENT if ALL enrollments are PASS
            if ($allEnrollments > 0 && $allEnrollments === $passedEnrollments) {
                $student->update(['role' => 'OLD_STUDENT']);
            }
        }
    }
}
