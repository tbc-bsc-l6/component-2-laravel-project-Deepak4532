<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\User;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the dashboard based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Load role-specific data
        $data = [];

        if ($user->role === 'ADMIN') {
            $data = $this->getAdminData();
        } elseif ($user->role === 'TEACHER') {
            $data = $this->getTeacherData($user);
        } elseif ($user->role === 'STUDENT') {
            $data = $this->getStudentData($user);
        } elseif ($user->role === 'OLD_STUDENT') {
            $data = $this->getOldStudentData($user);
        }

        return Inertia::render('Dashboard', $data);
    }

    /**
     * Get admin dashboard data.
     */
    private function getAdminData()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('role', '!=', 'OLD_STUDENT')->count();
        $activeModules = Module::where('is_active', true)->count();
        $totalEnrollments = Enrollment::count();
        $activeTeachers = User::where('role', 'TEACHER')->count();
        $completedEnrollments = Enrollment::where('status', 'completed')->count();
        $completionRate = $totalEnrollments > 0 ? round(($completedEnrollments / $totalEnrollments) * 100, 2) : 0;

        $stats = [
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'activeModules' => $activeModules,
            'totalEnrollments' => $totalEnrollments,
            'activeTeachers' => $activeTeachers,
            'completionRate' => $completionRate,
        ];

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

        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ];
        });

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

        return [
            'dashboardData' => [
                'stats' => $stats,
                'modules' => $modules->toArray(),
                'users' => $users->toArray(),
                'enrollments' => $enrollments->toArray(),
            ],
        ];
    }

    /**
     * Get teacher dashboard data.
     */
    private function getTeacherData($user)
    {
        $modules = Module::where('teacher_id', $user->id)->get()->map(function ($module) {
            return [
                'id' => $module->id,
                'name' => $module->name,
                'description' => $module->description,
                'student_count' => $module->enrollments()->count(),
                'is_active' => $module->is_active,
                'created_at' => $module->created_at,
            ];
        });

        $enrollments = Enrollment::whereHas('module', function ($query) use ($user) {
            $query->where('teacher_id', $user->id);
        })->with('student', 'module')->get()->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'module_id' => $enrollment->module_id,
                'student_name' => $enrollment->student?->name ?? 'Unknown',
                'student_email' => $enrollment->student?->email ?? 'N/A',
                'module_name' => $enrollment->module?->name ?? 'Unknown',
                'status' => $enrollment->status,
            ];
        });

        return [
            'dashboardData' => [
                'modules' => $modules->toArray(),
                'enrollments' => $enrollments->toArray(),
                'totalModules' => $modules->count(),
                'totalStudents' => Enrollment::whereHas('module', function ($query) use ($user) {
                    $query->where('teacher_id', $user->id);
                })->count(),
            ],
        ];
    }

    /**
     * Get student dashboard data.
     */
    private function getStudentData($user)
    {
        $enrollments = Enrollment::where('student_id', $user->id)->with('module')->get()->map(function ($enrollment) {
            return [
                'id' => $enrollment->id,
                'module_name' => $enrollment->module?->name ?? 'Unknown',
                'module_id' => $enrollment->module?->id,
                'teacher_name' => $enrollment->module?->teacher?->name ?? 'Unassigned',
                'status' => $enrollment->status,
                'start_date' => $enrollment->start_date,
                'completion_date' => $enrollment->completion_date,
            ];
        });

        $allModules = Module::where('is_active', true)->get()->map(function ($module) {
            return [
                'id' => $module->id,
                'name' => $module->name,
                'description' => $module->description,
                'teacher_name' => $module->teacher?->name ?? 'Unassigned',
                'is_enrolled' => Enrollment::where('student_id', auth()->id())
                    ->where('module_id', $module->id)
                    ->exists(),
            ];
        });

        return [
            'dashboardData' => [
                'enrollments' => $enrollments->toArray(),
                'modules' => $allModules->toArray(),
                'totalEnrolled' => $enrollments->count(),
                'completedCourses' => Enrollment::where('student_id', $user->id)
                    ->where('status', 'completed')
                    ->count(),
            ],
        ];
    }

    /**
     * Get old student dashboard data.
     */
    private function getOldStudentData($user)
    {
        $completedEnrollments = Enrollment::where('student_id', $user->id)
            ->where('status', 'completed')
            ->with('module')
            ->get()->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'module_name' => $enrollment->module?->name ?? 'Unknown',
                    'completion_date' => $enrollment->completion_date,
                ];
            });

        return [
            'dashboardData' => [
                'completedCourses' => $completedEnrollments->toArray(),
                'totalCourses' => $completedEnrollments->count(),
            ],
        ];
    }
}
