<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Student\EnrollmentController as StudentEnrollmentController;
use App\Http\Controllers\Teacher\ModuleController as TeacherModuleController;

// Public endpoints (no authentication required)
Route::get('/users/by-role/{role}', function ($role) {
    $validRoles = ['ADMIN', 'TEACHER', 'STUDENT', 'OLD_STUDENT'];
    
    if (!in_array($role, $validRoles)) {
        return response()->json(['error' => 'Invalid role'], 400);
    }
    
    $users = \App\Models\User::where('role', $role)->get(['id', 'name', 'email', 'role']);
    return response()->json($users);
});

// API routes require authentication (session or sanctum token)
Route::middleware(['web', 'auth'])->group(function () {
    // Get authenticated user
    Route::get('/user', function () {
        $user = auth()->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    });

    // Student enrollment
    Route::middleware('role:STUDENT')->group(function () {
        Route::post('/student/enroll', [StudentEnrollmentController::class, 'enroll']);
        Route::get('/student/enrollments/active', [StudentEnrollmentController::class, 'getActive']);
        Route::get('/student/enrollments/completed', [StudentEnrollmentController::class, 'getCompleted']);
    });

    // Teacher endpoints
    Route::middleware('role:TEACHER')->group(function () {
        Route::get('/teacher/modules', [TeacherModuleController::class, 'index']);
        Route::get('/teacher/modules/{moduleId}/students', [TeacherModuleController::class, 'students']);
        Route::patch('/teacher/enrollments/status', [TeacherModuleController::class, 'updateStatus']);
    });
});