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
        if (!enrollment.status || enrollment.status === 'IN_PROGRESS') return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
        if (enrollment.status === 'PASS') return 'bg-green-500 bg-opacity-20 text-green-300';
        if (enrollment.status === 'FAIL') return 'bg-red-500 bg-opacity-20 text-red-300';
        return 'bg-slate-600 text-slate-300';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">👨‍🏫 Teacher Dashboard</h2>
                        <p className="text-sm text-slate-300 mt-1">Manage your modules, students, and assignments</p>
                    </div>
                    <div className="text-right bg-white bg-opacity-10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white border-opacity-20">
                        <p className="text-sm text-slate-300">Welcome back,</p>
                        <p className="text-lg font-semibold text-white">{user?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title="Teacher Dashboard" />

            <div className="py-12 bg-slate-950 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-indigo-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 p-6">
                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-indigo-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">My Modules</p>
                                    <p className="text-4xl font-bold text-white mt-2">{totalModules}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="h-2 bg-indigo-600 rounded-full" style={{ width: '70%' }}></div>
                                        <span className="text-indigo-400 text-xs font-semibold">Active</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-indigo-500 bg-opacity-20 rounded-xl text-3xl">📚</div>
                            </div>
                        </div>

                        <div className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-green-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 p-6">
                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-green-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Students</p>
                                    <p className="text-4xl font-bold text-white mt-2">{totalStudents}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="h-2 bg-green-600 rounded-full" style={{ width: '85%' }}></div>
                                        <span className="text-green-400 text-xs font-semibold">Enrolled</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-500 bg-opacity-20 rounded-xl text-3xl">👥</div>
                            </div>
                        </div>

                        <div className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-purple-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 p-6">
                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-purple-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Completed</p>
                                    <p className="text-4xl font-bold text-white mt-2">{enrollments.filter(e => e.status).length}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="h-2 bg-purple-600 rounded-full" style={{ width: '60%' }}></div>
                                        <span className="text-purple-400 text-xs font-semibold">Graded</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-500 bg-opacity-20 rounded-xl text-3xl">✅</div>
                            </div>
                        </div>
                    </div>

                    {formSuccess && (
                        <div className="mb-4 p-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-xl text-green-300">
                            {formSuccess}
                        </div>
                    )}
                    {formError && (
                        <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl text-red-300">
                            {formError}
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="mb-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                        <div className="flex bg-slate-900 p-2 gap-2">
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`flex-1 py-3 px-4 font-medium transition-all duration-300 rounded-lg ${
                                    activeTab === 'students'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                👥 Students
                            </button>
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className={`flex-1 py-3 px-4 font-medium transition-all duration-300 rounded-lg ${
                                    activeTab === 'assignments'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                📝 Assignments
                            </button>
                        </div>
                    </div>

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel - Modules List */}
                        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600">
                                <h3 className="text-lg font-semibold text-white">📚 Your Modules</h3>
                            </div>
                            {modules.length === 0 ? (
                                <div className="p-6 text-center">
                                    <p className="text-slate-400">No modules assigned yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                                    {modules.map((module) => (
                                        <div
                                            key={module.id}
                                            onClick={() => setActiveModule(module.id)}
                                            className={`p-4 cursor-pointer transition-all duration-300 ${
                                                activeModule === module.id
                                                    ? 'bg-indigo-600 bg-opacity-20 border-l-4 border-indigo-500'
                                                    : 'bg-slate-800 hover:bg-slate-700 border-l-4 border-transparent hover:border-slate-600'
                                            }`}
                                        >
                                            <h4 className="font-semibold text-white">{module.name}</h4>
                                            <p className="text-xs text-slate-400 mt-1">{module.description}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    module.is_active
                                                        ? 'bg-green-500 bg-opacity-20 text-green-300'
                                                        : 'bg-slate-600 text-slate-300'
                                                }`}>
                                                    {module.is_active ? '✓ Active' : '✕ Inactive'}
                                                </span>
                                                <span className="text-xs font-medium text-slate-400">{module.student_count} students</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Panel - Students in Selected Module */}
                        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                            <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-emerald-600 to-teal-600">
                                <h3 className="text-lg font-semibold text-white">
                                    👥 {activeModule ? modules.find(m => m.id === activeModule)?.name : 'Select a Module'}
                                </h3>
                                {activeModule && (
                                    <p className="text-sm text-emerald-100 mt-1">
                                        {modules.find(m => m.id === activeModule)?.description}
                                    </p>
                                )}
                            </div>

                            {!activeModule ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400 text-lg">Select a module to view students</p>
                                </div>
                            ) : getStudentsForModule(activeModule).length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400">No students enrolled in this module yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700 border-b border-slate-600">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Student Name</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {getStudentsForModule(activeModule).map((enrollment) => (
                                                <tr key={enrollment.id} className="hover:bg-slate-700 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-white">{enrollment.student_name}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-400">{enrollment.student_email}</p>
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
                                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    Pass
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'FAIL')}
                                                                    disabled={markingCompletion === enrollment.id}
                                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    Fail
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-slate-400">Completed</span>
                                                                <button
                                                                    onClick={() => handleMarkCompletion(enrollment.id, 'IN_PROGRESS')}
                                                                    disabled={markingCompletion === enrollment.id}
                                                                    className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
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
                            <h3 className="text-xl font-semibold text-white">📝 Assignment Management</h3>
                            <button
                                onClick={() => setShowCreateAssignmentModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                            >
                                + Create Assignment
                            </button>
                        </div>

                        {/* Create Assignment Modal */}
                        {showCreateAssignmentModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className="bg-slate-800 rounded-2xl shadow-xl max-w-md w-full border border-slate-700">
                                    <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600">
                                        <h3 className="text-lg font-semibold text-white">Create New Assignment</h3>
                                    </div>

                                    <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Module
                                            </label>
                                            <select
                                                value={assignmentForm.module_id}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, module_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={assignmentForm.title}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                                placeholder="Assignment title"
                                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={assignmentForm.description}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                                placeholder="Assignment description"
                                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                rows="3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Due Date & Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={assignmentForm.due_date}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={assignmentForm.status}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, status: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                                                className="px-4 py-2 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={formLoading}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                                            >
                                                {formLoading ? 'Creating...' : 'Create Assignment'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Assignments List */}
                        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                            {modules.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-400">No modules assigned yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700 border-b border-slate-600">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Module</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Title</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Due Date</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {modules.length > 0 ? (
                                                modules.map((module) => (
                                                    <tr key={module.id} className="hover:bg-slate-700 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="font-medium text-white">{module.name}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-400">No assignments yet</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm text-slate-400">-</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-600 text-slate-300">
                                                                Create one
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-4 text-center text-slate-400">
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
