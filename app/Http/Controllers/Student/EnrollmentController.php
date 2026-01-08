<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EnrollmentController extends Controller
{
    public function __construct(private EnrollmentService $enrollmentService)
    {
    }

    /**
     * Enroll the authenticated student in a module.
     */
    public function enroll(Request $request)
    {
        // Ensure user is a student
        if ($request->user()->role !== 'STUDENT') {
            return response()->json([
                'message' => 'Only students can enroll in modules.',
            ], 403);
        }

        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
        ]);

        try {
            $module = Module::findOrFail($validated['module_id']);
            $enrollment = $this->enrollmentService->enrollStudent($request->user(), $module);

            return response()->json([
                'message' => 'Successfully enrolled in module.',
                'enrollment' => $enrollment->load('module'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Enrollment failed.',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get active enrollments for the authenticated student.
     */
    public function getActive(Request $request)
    {
        $enrollments = $this->enrollmentService->getActiveEnrollments($request->user());

        return response()->json([
            'enrollments' => $enrollments->load('module'),
        ]);
    }

    /**
     * Get completed enrollments for the authenticated student.
     */
    public function getCompleted(Request $request)
    {
        $enrollments = $this->enrollmentService->getCompletedEnrollments($request->user());

        return response()->json([
            'enrollments' => $enrollments->load('module'),
        ]);
    }
}
