<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\User;
use App\Models\Enrollment;
use App\Models\Assignment;
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

        $assignments = Assignment::whereHas('module', function ($query) use ($user) {
            $query->where('teacher_id', $user->id);
        })->with('module')->get()->map(function ($assignment) {
            return [
                'id' => $assignment->id,
                'module_id' => $assignment->module_id,
                'module_name' => $assignment->module?->name ?? 'Unknown',
                'title' => $assignment->title,
                'description' => $assignment->description,
                'due_date' => $assignment->due_date,
                'status' => $assignment->status,
                'created_at' => $assignment->created_at,
            ];
        });

        return [
            'dashboardData' => [
                'modules' => $modules->toArray(),
                'enrollments' => $enrollments->toArray(),
                'assignments' => $assignments->toArray(),
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
        // Get current enrollments (IN_PROGRESS)
        $currentEnrollments = Enrollment::where('user_id', $user->id)
            ->where('status', 'IN_PROGRESS')
            ->with('module.teacher')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'module_id' => $enrollment->module_id,
                    'module' => [
                        'id' => $enrollment->module?->id,
                        'name' => $enrollment->module?->name ?? 'Unknown',
                        'description' => $enrollment->module?->description,
                        'teacher_name' => $enrollment->module?->teacher?->name ?? 'Unassigned',
                    ],
                    'status' => $enrollment->status,
                    'created_at' => $enrollment->created_at,
                    'start_date' => $enrollment->start_date,
                ];
            });

        // Get completed enrollments (PASS/FAIL)
        $completedEnrollments = Enrollment::where('user_id', $user->id)
            ->whereIn('status', ['PASS', 'FAIL'])
            ->with('module.teacher')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'module_id' => $enrollment->module_id,
                    'module' => [
                        'id' => $enrollment->module?->id,
                        'name' => $enrollment->module?->name ?? 'Unknown',
                        'description' => $enrollment->module?->description,
                        'teacher_name' => $enrollment->module?->teacher?->name ?? 'Unassigned',
                    ],
                    'status' => $enrollment->status,
                    'created_at' => $enrollment->created_at,
                    'updated_at' => $enrollment->updated_at,
                    'completion_date' => $enrollment->completion_date,
                ];
            });

        // Get enrolled module IDs (including completed)
        $enrolledModuleIds = Enrollment::where('user_id', $user->id)
            ->whereIn('status', ['IN_PROGRESS', 'PASS', 'FAIL'])
            ->pluck('module_id')
            ->toArray();

        $canEnrollMore = count($enrolledModuleIds) < 4;

        // Get available modules (not enrolled and under 4 enrollments)
        $availableModules = [];
        if ($canEnrollMore) {
            $availableModules = Module::where('is_active', true)
                ->whereNotIn('id', $enrolledModuleIds)
                ->with('teacher')
                ->get()
                ->map(function ($module) {
                    return [
                        'id' => $module->id,
                        'name' => $module->name,
                        'description' => $module->description,
                        'teacher_name' => $module->teacher?->name ?? 'Unassigned',
                        'student_count' => $module->enrollments()->count(),
                        'created_at' => $module->created_at,
                    ];
                })
                ->toArray();
        }

        // Get all active modules (for All Modules tab)
        $allModules = Module::where('is_active', true)
            ->with('teacher')
            ->get()
            ->map(function ($module) {
                return [
                    'id' => $module->id,
                    'name' => $module->name,
                    'description' => $module->description,
                    'teacher_name' => $module->teacher?->name ?? 'Unassigned',
                    'student_count' => $module->enrollments()->count(),
                    'created_at' => $module->created_at,
                ];
            })
            ->toArray();

        return [
            'dashboardData' => [
                'currentEnrollments' => $currentEnrollments->toArray(),
                'completedEnrollments' => $completedEnrollments->toArray(),
                'availableModules' => $availableModules,
                'allModules' => $allModules,
                'totalCurrent' => $currentEnrollments->count(),
                'totalCompleted' => $completedEnrollments->count(),
                'totalPassed' => $completedEnrollments->filter(fn($e) => $e['status'] === 'PASS')->count(),
                'totalFailed' => $completedEnrollments->filter(fn($e) => $e['status'] === 'FAIL')->count(),
                'canEnrollMore' => $canEnrollMore,
            ],
        ];
    }

    /**
     * Get old student dashboard data.
     */
    private function getOldStudentData($user)
    {
        $completedEnrollments = Enrollment::where('user_id', $user->id)
            ->whereIn('status', ['PASS', 'FAIL'])
            ->with('module.teacher')
            ->get()->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'module_id' => $enrollment->module_id,
                    'module' => [
                        'id' => $enrollment->module?->id,
                        'name' => $enrollment->module?->name ?? 'Unknown',
                        'description' => $enrollment->module?->description,
                        'teacher_name' => $enrollment->module?->teacher?->name ?? 'Unassigned',
                    ],
                    'status' => $enrollment->status,
                    'created_at' => $enrollment->created_at,
                    'updated_at' => $enrollment->updated_at,
                    'completion_date' => $enrollment->completion_date,
                ];
            });

        return [
            'dashboardData' => [
                'completedEnrollments' => $completedEnrollments->toArray(),
                'totalCompleted' => $completedEnrollments->count(),
                'totalPassed' => $completedEnrollments->filter(fn($e) => $e['status'] === 'PASS')->count(),
                'totalFailed' => $completedEnrollments->filter(fn($e) => $e['status'] === 'FAIL')->count(),
            ],
        ];
    }
}
