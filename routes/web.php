<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\AssignmentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Teacher routes
    Route::middleware('role:TEACHER')->group(function () {
        Route::patch('/teacher/enrollments/{enrollmentId}/mark-completion', [AdminController::class, 'markStudentCompletion'])->name('teacher.enrollments.mark-completion');
        Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
        Route::patch('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
        Route::patch('/assignments/{submission}/grade', [AssignmentController::class, 'gradeSubmission'])->name('assignments.grade');
    });

    // Student routes
    Route::middleware('role:STUDENT')->group(function () {
        Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->name('assignments.submit');
    });
    
    // Admin routes for dashboard actions
    Route::middleware('role:ADMIN')->group(function () {
        Route::post('/admin/modules', [AdminController::class, 'createModule'])->name('admin.modules.store');
        Route::patch('/admin/modules/{moduleId}/assign-teacher', [AdminController::class, 'assignTeacher'])->name('admin.modules.assign-teacher');
        Route::patch('/admin/modules/{moduleId}/toggle-status', [AdminController::class, 'toggleModuleStatus'])->name('admin.modules.toggle-status');
        Route::post('/admin/teachers', [AdminController::class, 'createTeacher'])->name('admin.teachers.store');
        Route::post('/admin/enroll-student', [AdminController::class, 'enrollStudent'])->name('admin.enroll-student');
        Route::patch('/admin/users/{userId}/change-role', [AdminController::class, 'changeUserRole'])->name('admin.users.change-role');
        Route::delete('/admin/users/{userId}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
        Route::delete('/admin/teachers/{teacherId}', [AdminController::class, 'deleteTeacher'])->name('admin.teachers.delete');
    });
});

require __DIR__.'/auth.php';
