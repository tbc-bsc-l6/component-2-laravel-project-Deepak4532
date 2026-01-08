<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Enrollment;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ModuleController extends Controller
{
    public function __construct(private EnrollmentService $enrollmentService)
    {
    }

    /**
     * Get all modules assigned to the logged-in teacher.
     */
    public function index(Request $request)
    {
        $modules = Module::where('teacher_id', $request->user()->id)
            ->with('enrollments')
            ->get();

        return response()->json([
            'modules' => $modules,
        ]);
    }

    /**
     * Get enrolled students for a specific module.
     */
    public function students(Request $request, $moduleId)
    {
        $module = Module::findOrFail($moduleId);

        // Ensure teacher owns this module
        if ($module->teacher_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $enrollments = $module->enrollments()
            ->with('student')
            ->get();

        return response()->json([
            'module' => $module,
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Update enrollment status (PASS or FAIL) for a student.
     */
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'status' => 'required|in:PASS,FAIL',
        ]);

        $enrollment = Enrollment::findOrFail($validated['enrollment_id']);
        $module = $enrollment->module;

        // Ensure teacher owns the module
        if ($module->teacher_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        try {
            $this->enrollmentService->completeEnrollment($enrollment, $validated['status']);

            return response()->json([
                'message' => 'Enrollment status updated successfully.',
                'enrollment' => $enrollment->load('student', 'module'),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Failed to update enrollment status.',
                'errors' => $e->errors(),
            ], 422);
        }
    }
}
