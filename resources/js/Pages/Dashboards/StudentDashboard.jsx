import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function StudentDashboard({ user, dashboardData }) {
    const [activeTab, setActiveTab] = useState('current');
    const [currentEnrollments, setCurrentEnrollments] = useState(dashboardData?.currentEnrollments || []);
    const [completedEnrollments, setCompletedEnrollments] = useState(dashboardData?.completedEnrollments || []);
    const [availableModules, setAvailableModules] = useState(dashboardData?.availableModules || []);
    const [allModules, setAllModules] = useState(dashboardData?.allModules || []);
    const [loading, setLoading] = useState(false);
    const [enrollingModuleId, setEnrollingModuleId] = useState(null);
    const [enrollmentError, setEnrollmentError] = useState(null);
    const [enrollmentSuccess, setEnrollmentSuccess] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);

    const maxEnrollments = 4;
    const canEnroll = currentEnrollments.length < maxEnrollments;

    // Update state when dashboardData changes
    useEffect(() => {
        if (dashboardData) {
            setCurrentEnrollments(dashboardData.currentEnrollments || []);
            setCompletedEnrollments(dashboardData.completedEnrollments || []);
            setAvailableModules(dashboardData.availableModules || []);
            setAllModules(dashboardData.allModules || []);
        }
    }, [dashboardData]);

    const handleEnroll = async (moduleId) => {
        setEnrollingModuleId(moduleId);
        setEnrollmentError(null);
        setEnrollmentSuccess(null);

        try {
            const response = await fetch('/api/student/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ module_id: moduleId }),
            });

            if (response.ok) {
                const data = await response.json();
                const newEnrollment = data.enrollment;
                
                // Add to current enrollments
                setCurrentEnrollments([...currentEnrollments, {
                    id: newEnrollment.id,
                    module_id: newEnrollment.module_id,
                    module: newEnrollment.module,
                    status: newEnrollment.status || 'IN_PROGRESS',
                    created_at: newEnrollment.created_at || new Date().toISOString(),
                }]);
                
                // Remove from available modules
                setAvailableModules(availableModules.filter(m => m.id !== moduleId));
                
                setEnrollmentSuccess('Successfully enrolled in module!');
                setTimeout(() => setEnrollmentSuccess(null), 3000);
            } else {
                const error = await response.json();
                setEnrollmentError(error.message || 'Enrollment failed');
            }
        } catch (error) {
            console.error('Error enrolling:', error);
            setEnrollmentError('Error enrolling in module');
        } finally {
            setEnrollingModuleId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        if (status === 'PASS') return { text: '✓ PASS', bg: 'bg-green-500 bg-opacity-20', text_color: 'text-green-300' };
        if (status === 'FAIL') return { text: '✗ FAIL', bg: 'bg-red-500 bg-opacity-20', text_color: 'text-red-300' };
        return { text: 'IN PROGRESS', bg: 'bg-yellow-500 bg-opacity-20', text_color: 'text-yellow-300' };
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">👨‍🎓 Student Dashboard</h2>
                        <p className="text-sm text-slate-300 mt-1">Manage your modules and view your progress</p>
                    </div>
                    <div className="text-right bg-white bg-opacity-10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white border-opacity-20">
                        <p className="text-sm text-slate-300">Welcome back,</p>
                        <p className="text-lg font-semibold text-white">{user?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title="Student Dashboard" />

            <div className="py-12 bg-slate-950 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-indigo-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 p-6">
                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-indigo-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Current Modules</p>
                                    <p className="text-4xl font-bold text-white mt-2">{currentEnrollments.length}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="h-2 bg-indigo-600 rounded-full" style={{ width: `${(currentEnrollments.length / maxEnrollments) * 100}%` }}></div>
                                        <span className="text-indigo-400 text-xs font-semibold">{maxEnrollments - currentEnrollments.length} slots left</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-indigo-500 bg-opacity-20 rounded-xl text-3xl">📚</div>
                            </div>
                        </div>

                        <div className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-green-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 p-6">
                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-green-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Passed</p>
                                    <p className="text-4xl font-bold text-white mt-2">{completedEnrollments.filter(e => e.status === 'PASS').length}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-green-400 text-xs font-semibold">Completed</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-500 bg-opacity-20 rounded-xl text-3xl">✅</div>
                            </div>
                        </div>

                        <div className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-orange-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 p-6">
                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-orange-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Failed</p>
                                    <p className="text-4xl font-bold text-white mt-2">{completedEnrollments.filter(e => e.status === 'FAIL').length}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-orange-400 text-xs font-semibold">Not passed</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-orange-500 bg-opacity-20 rounded-xl text-3xl">⚠️</div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {enrollmentSuccess && (
                        <div className="mb-4 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-xl text-green-300">
                            {enrollmentSuccess}
                        </div>
                    )}
                    {enrollmentError && (
                        <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl text-red-300">
                            {enrollmentError}
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="mb-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                        <div className="flex bg-slate-900 p-2 gap-2">
                            <button
                                onClick={() => setActiveTab('current')}
                                className={`flex-1 py-3 px-4 font-medium transition-all duration-300 rounded-lg ${
                                    activeTab === 'current'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                📚 Current Modules ({currentEnrollments.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`flex-1 py-3 px-4 font-medium transition-all duration-300 rounded-lg ${
                                    activeTab === 'completed'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                📖 Completed ({completedEnrollments.length})
                            </button>
                            {canEnroll && (
                                <button
                                    onClick={() => setActiveTab('available')}
                                    className={`flex-1 py-3 px-4 font-medium transition-all duration-300 rounded-lg ${
                                        activeTab === 'available'
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    🔗 Available ({availableModules.length})
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-3 px-4 font-medium transition-all duration-300 rounded-lg ${
                                    activeTab === 'all'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                📋 All Modules ({allModules.length})
                            </button>
                        </div>
                    </div>

                    {/* Current Modules Tab */}
                    {activeTab === 'current' && (
                        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                            {currentEnrollments.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400 text-lg">No current enrollments</p>
                                    <p className="text-slate-500 text-sm mt-2">Enroll in modules from the Available section</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700 border-b border-slate-600">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Module Name</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Description</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Teacher</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Enrolled</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {currentEnrollments.map((enrollment) => (
                                                <tr key={enrollment.id} className="hover:bg-slate-700 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-white">{enrollment.module?.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-400 line-clamp-2">{enrollment.module?.description}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-300">{enrollment.module?.teacher_name || 'Unassigned'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-400">{formatDate(enrollment.created_at)}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Completed Modules Tab */}
                    {activeTab === 'completed' && (
                        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                            {completedEnrollments.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400 text-lg">No completed modules</p>
                                    <p className="text-slate-500 text-sm mt-2">Complete and pass modules to see your history</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700 border-b border-slate-600">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Module Name</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Teacher</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Completed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {completedEnrollments.map((enrollment) => {
                                                const badge = getStatusBadge(enrollment.status);
                                                return (
                                                    <tr key={enrollment.id} className="hover:bg-slate-700 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-white">{enrollment.module?.name}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text_color}`}>
                                                                {badge.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-300">{enrollment.module?.teacher_name || 'Unassigned'}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-400">{formatDate(enrollment.updated_at)}</p>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Available Modules Tab */}
                    {activeTab === 'available' && canEnroll && (
                        <div className="space-y-4">
                            {availableModules.length === 0 ? (
                                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl p-12 text-center">
                                    <p className="text-slate-400 text-lg">No available modules</p>
                                    <p className="text-slate-500 text-sm mt-2">All modules are currently enrolled or coming soon</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableModules.map((module) => (
                                        <div key={module.id} className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-green-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 p-6">
                                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-green-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                                            <div className="relative space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{module.name}</h3>
                                                    <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                                                </div>
                                                <div className="pt-2 border-t border-slate-700 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-slate-400">Teacher:</span>
                                                        <span className="text-sm font-medium text-slate-300">{module.teacher_name || 'Unassigned'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-slate-400">Students:</span>
                                                        <span className="text-sm font-medium text-slate-300">{module.student_count || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setSelectedModule(module)}
                                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 text-sm font-semibold transition-all"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleEnroll(module.id)}
                                                        disabled={enrollingModuleId === module.id}
                                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {enrollingModuleId === module.id ? 'Enrolling...' : 'Enroll Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Modules Tab */}
                    {activeTab === 'all' && (
                        <div className="space-y-4">
                            {allModules.length === 0 ? (
                                <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl p-12 text-center">
                                    <p className="text-slate-400 text-lg">No modules available</p>
                                    <p className="text-slate-500 text-sm mt-2">Check back soon for new modules</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allModules.map((module) => {
                                        const isEnrolled = currentEnrollments.some(e => e.module_id === module.id);
                                        const isCompleted = completedEnrollments.some(e => e.module_id === module.id);
                                        
                                        return (
                                            <div key={module.id} className={`group rounded-2xl border overflow-hidden shadow-lg transition-all duration-300 p-6 ${
                                                isEnrolled 
                                                    ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/50 hover:border-indigo-400'
                                                    : isCompleted
                                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 opacity-75'
                                                    : canEnroll
                                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-green-500 hover:shadow-2xl hover:shadow-green-500/20'
                                                    : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600'
                                            }`}>
                                                <div className={`absolute inset-0 -top-20 -right-20 w-40 h-40 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 ${
                                                    isEnrolled ? 'bg-indigo-500' : 'bg-green-500'
                                                }`} />
                                                <div className="relative space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-white">{module.name}</h3>
                                                            <p className="text-sm text-slate-400 mt-1">{module.description}</p>
                                                        </div>
                                                        <div className="ml-2">
                                                            {isEnrolled && (
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/30 text-indigo-300">
                                                                    📚 Enrolled
                                                                </span>
                                                            )}
                                                            {isCompleted && (
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500/30 text-green-300">
                                                                    ✓ Completed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-700 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-slate-400">Teacher:</span>
                                                            <span className="text-sm font-medium text-slate-300">{module.teacher_name || 'Unassigned'}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-slate-400">Students:</span>
                                                            <span className="text-sm font-medium text-slate-300">{module.student_count || 0}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setSelectedModule(module)}
                                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 text-sm font-semibold transition-all"
                                                        >
                                                            View Details
                                                        </button>
                                                        {!isEnrolled && !isCompleted && canEnroll && (
                                                            <button
                                                                onClick={() => handleEnroll(module.id)}
                                                                disabled={enrollingModuleId === module.id}
                                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {enrollingModuleId === module.id ? 'Enrolling...' : 'Enroll Now'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Max Enrollment Reached Message */}
                    {!canEnroll && (
                        <div className="rounded-2xl bg-orange-500 bg-opacity-20 border border-orange-500 p-6 text-center">
                            <p className="text-orange-300 font-semibold">⚠️ You have reached the maximum enrollment limit</p>
                            <p className="text-orange-200 text-sm mt-2">You are currently enrolled in {maxEnrollments} modules. Complete a module to enroll in another.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Module Details Modal */}
            {selectedModule && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white">{selectedModule.name}</h2>
                                <p className="text-sm text-slate-400 mt-1">Module Details</p>
                            </div>
                            <button
                                onClick={() => setSelectedModule(null)}
                                className="text-slate-400 hover:text-white transition-colors text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                <p className="text-slate-300 leading-relaxed">{selectedModule.description || 'No description available'}</p>
                            </div>

                            {/* Module Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Teacher</p>
                                    <p className="text-lg font-semibold text-white">{selectedModule.teacher_name || 'Unassigned'}</p>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Students Enrolled</p>
                                    <p className="text-lg font-semibold text-white">{selectedModule.student_count || 0}</p>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Module ID</p>
                                    <p className="text-lg font-semibold text-white font-mono">{selectedModule.id}</p>
                                </div>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Created</p>
                                    <p className="text-lg font-semibold text-white">{formatDate(selectedModule.created_at)}</p>
                                </div>
                            </div>

                            {/* Additional Details */}
                            {selectedModule.content && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Content</h3>
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-300">
                                        <p className="whitespace-pre-wrap text-sm">{selectedModule.content}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status and Action */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Enrollment Status</h3>
                                {(() => {
                                    const isEnrolled = currentEnrollments.some(e => e.module_id === selectedModule.id);
                                    const isCompleted = completedEnrollments.some(e => e.module_id === selectedModule.id);
                                    
                                    if (isEnrolled) {
                                        return (
                                            <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-4">
                                                <p className="text-indigo-300 font-semibold">📚 You are currently enrolled in this module</p>
                                            </div>
                                        );
                                    } else if (isCompleted) {
                                        return (
                                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
                                                <p className="text-green-300 font-semibold">✓ You have completed this module</p>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setSelectedModule(null)}
                                                    className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                                                >
                                                    Close
                                                </button>
                                                {canEnroll && (
                                                    <button
                                                        onClick={() => {
                                                            handleEnroll(selectedModule.id);
                                                            setSelectedModule(null);
                                                        }}
                                                        disabled={enrollingModuleId === selectedModule.id}
                                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {enrollingModuleId === selectedModule.id ? 'Enrolling...' : 'Enroll Now'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
