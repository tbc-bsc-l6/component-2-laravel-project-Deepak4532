import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function TeacherDashboard({ user }) {
    const { dashboardData } = usePage().props;
    const [activeModule, setActiveModule] = useState(null);
    const [markingCompletion, setMarkingCompletion] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    const modules = dashboardData?.modules || [];
    const enrollments = dashboardData?.enrollments || [];
    const totalModules = dashboardData?.totalModules || 0;
    const totalStudents = dashboardData?.totalStudents || 0;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStudentsForModule = (moduleId) => {
        return enrollments.filter(e => e.module_id === moduleId || e.module_name === modules.find(m => m.id === moduleId)?.name);
    };

    const handleMarkCompletion = (enrollmentId, status) => {
        setMarkingCompletion(enrollmentId);
        setFormError(null);
        setFormSuccess(null);

        router.patch(
            `/teacher/enrollments/${enrollmentId}/mark-completion`,
            { status },
            {
                onSuccess: () => {
                    setMarkingCompletion(null);
                    setFormSuccess(`Student marked as ${status.toUpperCase()}!`);
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error marking completion:', errors);
                    setFormError('Failed to mark student completion');
                    setMarkingCompletion(null);
                },
            }
        );
    };

    const getStatusBadge = (enrollment) => {
        if (!enrollment.status) return 'Pending';
        if (enrollment.status === 'passed') return 'Passed';
        if (enrollment.status === 'failed') return 'Failed';
        return enrollment.status;
    };

    const getStatusColor = (enrollment) => {
        if (!enrollment.status) return 'bg-yellow-100 text-yellow-700';
        if (enrollment.status === 'passed') return 'bg-green-100 text-green-700';
        if (enrollment.status === 'failed') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">👨‍🏫 Teacher Dashboard</h2>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Welcome back,</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title="Teacher Dashboard" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">My Modules</p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">{totalModules}</p>
                                    <p className="text-blue-600 text-xs mt-2">Active modules</p>
                                </div>
                                <div className="text-3xl">📚</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Students</p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">{totalStudents}</p>
                                    <p className="text-green-600 text-xs mt-2">Enrolled students</p>
                                </div>
                                <div className="text-3xl">👥</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                                    <p className="text-4xl font-bold text-gray-900 mt-2">{enrollments.filter(e => e.status).length}</p>
                                    <p className="text-purple-600 text-xs mt-2">Students graded</p>
                                </div>
                                <div className="text-3xl">✅</div>
                            </div>
                        </div>
                    </div>

                    {formSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                            {formSuccess}
                        </div>
                    )}
                    {formError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {formError}
                        </div>
                    )}

                    {/* Modules and Students View */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel - Modules List */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">📚 Your Modules</h3>
                            </div>
                            {modules.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-gray-600">No modules assigned yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                    {modules.map((module) => (
                                        <div
                                            key={module.id}
                                            onClick={() => setActiveModule(module.id)}
                                            className={`p-4 cursor-pointer transition-colors ${
                                                activeModule === module.id
                                                    ? 'bg-blue-50 border-l-4 border-blue-600'
                                                    : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <h4 className="font-semibold text-gray-900">{module.name}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    module.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {module.is_active ? '✓ Active' : '✕ Inactive'}
                                                </span>
                                                <span className="text-xs font-medium text-gray-600">{module.student_count} students</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Students in Selected Module */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    👥 {activeModule ? modules.find(m => m.id === activeModule)?.name : 'Select a Module'}
                                </h3>
                                {activeModule && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {modules.find(m => m.id === activeModule)?.description}
                                    </p>
                                )}
                            </div>

                            {!activeModule ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-600 text-lg">Select a module to view students</p>
                                </div>
                            ) : getStudentsForModule(activeModule).length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-600">No students enrolled in this module yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {getStudentsForModule(activeModule).map((enrollment) => (
                                                <tr key={enrollment.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-gray-900">{enrollment.student_name}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-600">{enrollment.student_email}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment)}`}>
                                                            {getStatusBadge(enrollment)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {!enrollment.status ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'passed')}
                                                                    disabled={markingCompletion === enrollment.id}
                                                                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Pass
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'failed')}
                                                                    disabled={markingCompletion === enrollment.id}
                                                                    className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Fail
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500">Completed</span>
                                                                <button
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'pending')}
                                                                    disabled={markingCompletion === enrollment.id}
                                                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-400 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Reset
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
