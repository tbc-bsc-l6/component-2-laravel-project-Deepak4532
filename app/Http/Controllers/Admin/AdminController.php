<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get admin statistics.
     */
    public function getStats()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('role', '!=', 'OLD_STUDENT')->count();
        $activeModules = Module::where('is_active', true)->count();
        $totalEnrollments = Enrollment::count();
        $activeTeachers = User::where('role', 'TEACHER')->count();
        $completedEnrollments = Enrollment::where('status', 'completed')->count();
        $completionRate = $totalEnrollments > 0 ? round(($completedEnrollments / $totalEnrollments) * 100, 2) : 0;

        return response()->json([
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'activeModules' => $activeModules,
            'totalEnrollments' => $totalEnrollments,
            'activeTeachers' => $activeTeachers,
            'completionRate' => $completionRate,
        ]);
    }

    /**
     * Get all modules with teacher info.
     */
    public function getModules()
    {
        $modules = Module::with('teacher')->get()->map(function ($module) {
            return [
                'id' => $module->id,
                'name' => $module->name,
                'description' => $module->description,
                'teacher_name' => $module->teacher?->name ?? 'Unassigned',
                'teacher_email' => $module->teacher?->email ?? 'N/A',
                'student_count' => $module->enrollments()->count(),
                'is_active' => $module->is_active,
                'created_at' => $module->created_at,
            ];
        });

        return response()->json($modules);
    }

    /**
     * Get all users.
     */
    public function getUsers()
    {
        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json($users);
    }

    /**
     * Get all enrollments with related data.
     */
    public function getEnrollments()
    {
        $enrollments = Enrollment::with('student', 'module')->get()->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'student_name' => $enrollment->student?->name ?? 'Unknown',
                'student_email' => $enrollment->student?->email ?? 'N/A',
                'module_name' => $enrollment->module?->name ?? 'Unknown',
                'status' => $enrollment->status,
                'start_date' => $enrollment->start_date,
                'completion_date' => $enrollment->completion_date,
            ];
        });

        return response()->json($enrollments);
    }

    /**
     * Create a new module.
     */
    public function createModule(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'teacher_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ]);

        // Set is_active to true by default if not provided
        $validated['is_active'] = $validated['is_active'] ?? true;

        $module = Module::create($validated);

        // Redirect back to dashboard
        return redirect()->route('dashboard');
    }

    /**
     * Archive a module.
     */
    public function archiveModule(Request $request, $moduleId)
    {
        $module = Module::findOrFail($moduleId);
        $module->archive();

        return response()->json([
            'message' => 'Module archived successfully.',
            'module' => $module,
        ]);
    }

    /**
     * Assign a teacher to a module.
     */
    public function assignTeacher(Request $request, $moduleId)
    {
        $validated = $request->validate([
            'teacher_id' => 'required|exists:users,id',
        ]);

        $module = Module::findOrFail($moduleId);
        $teacher = User::findOrFail($validated['teacher_id']);

        if ($teacher->role !== 'TEACHER') {
            return back()->with('error', 'Only users with TEACHER role can be assigned.');
        }

        $module->update(['teacher_id' => $validated['teacher_id']]);

        // Return to dashboard which will trigger Inertia refresh
        return redirect()->route('dashboard');
    }

    /**
     * Change user role.
     */
    public function changeRole(Request $request, $userId)
    {
        $validated = $request->validate([
            'role' => 'required|in:ADMIN,TEACHER,STUDENT,OLD_STUDENT',
        ]);

        $user = User::findOrFail($userId);
        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'User role updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * Change user role from admin dashboard.
     */
    public function changeUserRole(Request $request, $userId)
    {
        $validated = $request->validate([
            'role' => 'required|in:ADMIN,TEACHER,STUDENT,OLD_STUDENT',
        ]);

        $user = User::findOrFail($userId);
        
        // Prevent changing your own role
        if ($user->id === auth()->id()) {
            return redirect()->route('dashboard')->with('error', 'You cannot change your own role.');
        }

        $user->update(['role' => $validated['role']]);

        return redirect()->route('dashboard');
    }

    /**
     * Create a new teacher account.
     */
    public function createTeacher(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'TEACHER',
        ]);

        return redirect()->route('dashboard');
    }

    /**
     * Toggle module active/inactive status.
     */
    public function toggleModuleStatus(Request $request, $moduleId)
    {
        $module = Module::findOrFail($moduleId);
        $module->update(['is_active' => !$module->is_active]);

        return redirect()->route('dashboard');
    }

    /**
     * Delete a user.
     */
    public function deleteUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        // Prevent deleting the authenticated user (themselves)
        if ($user->id === auth()->id()) {
            return redirect()->route('dashboard')->with('error', 'You cannot delete your own account.');
        }
        
        // Delete all enrollments associated with this user
        Enrollment::where('user_id', $user->id)->delete();
        
        // Delete all modules taught by this teacher
        if ($user->role === 'TEACHER') {
            $modules = Module::where('teacher_id', $user->id)->get();
            foreach ($modules as $module) {
                // Delete enrollments for these modules first
                Enrollment::where('module_id', $module->id)->delete();
                // Then delete the module
                $module->delete();
            }
        }
        
        // Finally delete the user
        $user->delete();

        return redirect()->route('dashboard');
    }

    /**
     * Delete a teacher.
     */
    public function deleteTeacher(Request $request, $teacherId)
    {
        $teacher = User::findOrFail($teacherId);
        
        // Verify the user is actually a teacher
        if ($teacher->role !== 'TEACHER') {
            return redirect()->route('dashboard')->with('error', 'Only teachers can be deleted using this endpoint.');
        }
        
        // Prevent deleting the authenticated user (themselves)
        if ($teacher->id === auth()->id()) {
            return redirect()->route('dashboard')->with('error', 'You cannot delete your own account.');
        }
        
        // Unassign this teacher from all their modules
        Module::where('teacher_id', $teacher->id)->update(['teacher_id' => null]);
        
        // Delete the teacher account
        $teacher->delete();

        return redirect()->route('dashboard');
    }

    /**
     * Mark a student's enrollment completion with PASS/FAIL status.
     */
    public function markStudentCompletion(Request $request, $enrollmentId)
    {
        $validated = $request->validate([
            'status' => 'required|in:PASS,FAIL,IN_PROGRESS',
        ]);

        $enrollment = Enrollment::findOrFail($enrollmentId);
        
        // Verify the teacher owns this enrollment's module
        $module = $enrollment->module;
        if ($module->teacher_id !== auth()->id()) {
            return redirect()->route('dashboard')->with('error', 'Unauthorized action.');
        }

        // Update the enrollment with completion status and timestamp
        $enrollment->update([
            'status' => $validated['status'],
            'completion_date' => $validated['status'] === 'IN_PROGRESS' ? null : now(),
        ]);

        return redirect()->route('dashboard');
    }

    /**
     * Remove a student from a module.
     */
    public function removeStudent(Request $request, $enrollmentId)
    {
        $enrollment = Enrollment::findOrFail($enrollmentId);
        $enrollment->delete();

        return response()->json([
            'message' => 'Student removed from module successfully.',
        ]);
    }

    /**
     * Enroll a student in a module.
     */
    public function enrollStudent(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'module_id' => 'required|exists:modules,id',
        ]);

        // Check if student is already enrolled
        $existingEnrollment = Enrollment::where('user_id', $validated['student_id'])
            ->where('module_id', $validated['module_id'])
            ->first();

        if ($existingEnrollment) {
            return back()->withErrors([
                'module_id' => 'Student is already enrolled in this module.',
            ]);
        }

        // Create enrollment
        $enrollment = Enrollment::create([
            'user_id' => $validated['student_id'],
            'module_id' => $validated['module_id'],
            'status' => 'IN_PROGRESS',
        ]);

        return back();
    }
}
