<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Student\EnrollmentController as StudentEnrollmentController;
use App\Http\Controllers\Teacher\ModuleController as TeacherModuleController;
use App\Http\Controllers\Admin\AdminController;

// Public endpoints (no authentication required)
Route::get('/users/by-role/{role}', function ($role) {
    $validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'OLD_STUDENT'];
    
    if (!in_array($role, $validRoles)) {
        return response()->json(['error' => 'Invalid role'], 400);
    }
    
    $users = \App\Models\User::where('role', $role)->get(['id', 'name', 'email', 'role']);
    return response()->json($users);
});

// API routes require session authentication (for Inertia)
Route::middleware('auth')->group(function () {
    // Get authenticated user with role-based response
    Route::get('/user', function () {
        $user = auth()->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    });

    // Student routes
    Route::middleware('role:STUDENT')->group(function () {
        Route::post('/student/enroll', [StudentEnrollmentController::class, 'enroll']);
        Route::get('/student/enrollments/active', [StudentEnrollmentController::class, 'getActive']);
        Route::get('/student/enrollments/completed', [StudentEnrollmentController::class, 'getCompleted']);
    });

    // Teacher routes
    Route::middleware('role:TEACHER')->group(function () {
        Route::get('/teacher/modules', [TeacherModuleController::class, 'index']);
        Route::get('/teacher/modules/{moduleId}/students', [TeacherModuleController::class, 'students']);
        Route::patch('/teacher/enrollments/status', [TeacherModuleController::class, 'updateStatus']);
    });

    // Admin routes
    Route::middleware('role:ADMIN')->group(function () {
        Route::get('/admin/stats', [AdminController::class, 'getStats']);
        Route::get('/admin/modules', [AdminController::class, 'getModules']);
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::get('/admin/enrollments', [AdminController::class, 'getEnrollments']);
        Route::post('/admin/modules', [AdminController::class, 'createModule']);
        Route::patch('/admin/modules/{moduleId}/archive', [AdminController::class, 'archiveModule']);
        Route::patch('/admin/modules/{moduleId}/assign-teacher', [AdminController::class, 'assignTeacher']);
        Route::patch('/admin/users/{userId}/role', [AdminController::class, 'changeRole']);
        Route::delete('/admin/enrollments/{enrollmentId}', [AdminController::class, 'removeStudent']);
    });
});