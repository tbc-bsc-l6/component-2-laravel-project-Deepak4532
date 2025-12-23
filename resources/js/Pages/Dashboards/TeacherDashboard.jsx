import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function TeacherDashboard({ user }) {
    const { dashboardData } = usePage().props;
    const [activeTab, setActiveTab] = useState('students');
    const [activeModule, setActiveModule] = useState(null);
    const [markingCompletion, setMarkingCompletion] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);
    const [enrollments, setEnrollments] = useState(dashboardData?.enrollments || []);
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
    const [assignments, setAssignments] = useState(dashboardData?.assignments || []);
    const [formLoading, setFormLoading] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState({
        module_id: '',
        title: '',
        description: '',
        due_date: '',
        status: 'DRAFT',
    });

    const modules = dashboardData?.modules || [];
    const totalModules = dashboardData?.totalModules || 0;
    const totalStudents = dashboardData?.totalStudents || 0;

    // Update enrollments when dashboardData changes
    useEffect(() => {
        if (dashboardData?.enrollments) {
            setEnrollments(dashboardData.enrollments);
        }
    }, [dashboardData?.enrollments]);

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
                    setFormSuccess(`Student marked as ${status}!`);
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

    const handleCreateAssignment = (e) => {
        e.preventDefault();
        if (!assignmentForm.module_id) {
            setFormError('Please select a module');
            return;
        }

        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.post(
            '/assignments',
            assignmentForm,
            {
                onSuccess: () => {
                    setFormLoading(false);
                    setAssignmentForm({
                        module_id: '',
                        title: '',
                        description: '',
                        due_date: '',
                        status: 'DRAFT',
                    });
                    setShowCreateAssignmentModal(false);
                    setFormSuccess('Assignment created successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error creating assignment:', errors);
                    setFormError(errors.title || errors.due_date || 'Failed to create assignment');
                    setFormLoading(false);
                },
            }
        );
    };
    const getStatusBadge = (enrollment) => {
        if (!enrollment.status) return 'Pending';
        if (enrollment.status === 'PASS') return 'Passed';
        if (enrollment.status === 'FAIL') return 'Failed';
        if (enrollment.status === 'IN_PROGRESS') return 'In Progress';
        return enrollment.status;
    };

    const getStatusColor = (enrollment) => {
        if (!enrollment.status || enrollment.status === 'IN_PROGRESS') return 'bg-yellow-100 text-yellow-700';
        if (enrollment.status === 'PASS') return 'bg-green-100 text-green-700';
        if (enrollment.status === 'FAIL') return 'bg-red-100 text-red-700';
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

                    {/* Tab Navigation */}
                    <div className="mb-6 flex gap-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`py-3 px-4 font-medium transition-colors ${
                                activeTab === 'students'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            👥 Students
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`py-3 px-4 font-medium transition-colors ${
                                activeTab === 'assignments'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            📝 Assignments
                        </button>
                    </div>

                    {/* Students Tab */}
                    {activeTab === 'students' && (
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
                                                        {!enrollment.status || enrollment.status === 'IN_PROGRESS' ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'PASS')}
                                                                    disabled={markingCompletion === enrollment.id}
                                                                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                                >
                                                                    Pass
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'FAIL')}
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
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'IN_PROGRESS')}
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
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-gray-900">📝 Assignment Management</h3>
                            <button
                                onClick={() => setShowCreateAssignmentModal(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                + Create Assignment
                            </button>
                        </div>

                        {/* Create Assignment Modal */}
                        {showCreateAssignmentModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">Create New Assignment</h3>
                                    </div>

                                    <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Module
                                            </label>
                                            <select
                                                value={assignmentForm.module_id}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, module_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                required
                                            >
                                                <option value="">-- Select Module --</option>
                                                {modules.map((module) => (
                                                    <option key={module.id} value={module.id}>
                                                        {module.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={assignmentForm.title}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                                placeholder="Assignment title"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={assignmentForm.description}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                                placeholder="Assignment description"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                rows="3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Due Date & Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={assignmentForm.due_date}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <select
                                                value={assignmentForm.status}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                            >
                                                <option value="DRAFT">Draft (Not visible to students)</option>
                                                <option value="PUBLISHED">Published (Visible to students)</option>
                                            </select>
                                        </div>

                                        <div className="flex gap-2 justify-end pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateAssignmentModal(false);
                                                    setFormError(null);
                                                }}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={formLoading}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {formLoading ? 'Creating...' : 'Create Assignment'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Assignments List */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            {modules.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-600">No modules assigned yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Module</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {modules.length > 0 ? (
                                                modules.map((module) => (
                                                    <tr key={module.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-gray-900">{module.name}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600">No assignments yet</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-gray-600">-</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                                Create one
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-600">
                                                        No modules assigned yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
