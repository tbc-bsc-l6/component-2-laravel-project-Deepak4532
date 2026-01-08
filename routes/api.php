<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Student\EnrollmentController as StudentEnrollmentController;

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
    });
});