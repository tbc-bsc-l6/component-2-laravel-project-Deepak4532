<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    /**
     * Create a new assignment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date_format:Y-m-d H:i|after:now',
            'status' => 'required|in:DRAFT,PUBLISHED,CLOSED',
        ]);

        $assignment = Assignment::create($validated);

        return redirect()->route('dashboard');
    }

    /**
     * Update an assignment.
     */
    public function update(Request $request, Assignment $assignment)
    {
        // Verify teacher owns the module
        $this->authorize('update', $assignment);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'sometimes|date_format:Y-m-d H:i|after:now',
            'status' => 'sometimes|in:DRAFT,PUBLISHED,CLOSED',
        ]);

        $assignment->update($validated);

        return redirect()->route('dashboard');
    }

    /**
     * Delete an assignment.
     */
    public function destroy(Assignment $assignment)
    {
        // Verify teacher owns the module
        $this->authorize('delete', $assignment);

        $assignment->delete();

        return redirect()->route('dashboard');
    }

    /**
     * Student submits an assignment.
     */
    public function submit(Request $request, Assignment $assignment)
    {
        // Verify student is enrolled in the module
        $user = $request->user();
        $isEnrolled = $assignment->module->enrollments()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isEnrolled) {
            return redirect()->route('dashboard')->withErrors('Not enrolled in this module');
        }

        // Check if already submitted
        $existingSubmission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->first();

        $validated = $request->validate([
            'submission_text' => 'required_without:file|string|nullable',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('submissions', 'public');
        }

        if ($existingSubmission) {
            $existingSubmission->update([
                'submission_text' => $validated['submission_text'] ?? null,
                'file_path' => $filePath ?? $existingSubmission->file_path,
                'submitted_at' => now(),
            ]);
        } else {
            AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'user_id' => $user->id,
                'submission_text' => $validated['submission_text'] ?? null,
                'file_path' => $filePath,
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
            ]);
        }

        return redirect()->route('dashboard');
    }

    /**
     * Grade a submission.
     */
    public function gradeSubmission(Request $request, AssignmentSubmission $submission)
    {
        // Verify teacher owns the module
        $user = $request->user();
        if ($submission->assignment->module->teacher_id !== $user->id) {
            return redirect()->route('dashboard')->withErrors('Unauthorized');
        }

        $validated = $request->validate([
            'grade' => 'required|integer|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'grade' => $validated['grade'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'GRADED',
            'graded_at' => now(),
        ]);

        return redirect()->route('dashboard');
    }
}

