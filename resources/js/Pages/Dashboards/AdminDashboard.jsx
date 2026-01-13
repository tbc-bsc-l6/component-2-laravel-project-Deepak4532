import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ModalWrapper from '@/Components/ModalWrapper';
import FormField from '@/Components/FormField';
import FormMessages from '@/Components/FormMessages';
import FormButtons from '@/Components/FormButtons';

export default function AdminDashboard({ user }) {
    // Modal state for viewing students in a module
    const [showViewStudentsModal, setShowViewStudentsModal] = useState(false);
    const [studentsInModule, setStudentsInModule] = useState([]);
    const [viewModule, setViewModule] = useState(null);

    // Handler to open modal and fetch students for a module
    const handleViewStudents = (module) => {
        setViewModule(module);
        // Assume module.students is available in dashboardData, else fetch via API
        if (module.students) {
            setStudentsInModule(module.students);
            setShowViewStudentsModal(true);
        } else {
            // TODO: fetch students via API if not present
            setStudentsInModule([]);
            setShowViewStudentsModal(true);
        }
    };

    // Handler to remove a student from a module
    const handleRemoveStudent = (studentId) => {
        if (!viewModule) return;
        setFormLoading(true);
        router.delete(`/admin/modules/${viewModule.id}/students/${studentId}`, {
            onSuccess: () => {
                setStudentsInModule((prev) => prev.filter(s => s.id !== studentId));
                setFormSuccess('Student removed from module');
                setFormLoading(false);
            },
            onError: (errors) => {
                setFormError(errors.message || 'Failed to remove student');
                setFormLoading(false);
            }
        });
    };
    const { dashboardData } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');
    const [modules, setModules] = useState(dashboardData?.modules || []);
    const [users, setUsers] = useState(dashboardData?.users || []);
    const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
    const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showDeleteTeacherModal, setShowDeleteTeacherModal] = useState(false);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
    const [showEnrollStudentModal, setShowEnrollStudentModal] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
    const [selectedTeacherToDelete, setSelectedTeacherToDelete] = useState(null);
    const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [togglingModule, setTogglingModule] = useState(null);
    const [deletingTeacher, setDeletingTeacher] = useState(null);
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // Form states
    const [moduleForm, setModuleForm] = useState({
        name: '',
        description: '',
    });

    const [assignTeacherForm, setAssignTeacherForm] = useState({
        teacher_id: '',
    });

    const [addTeacherForm, setAddTeacherForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [changeRoleForm, setChangeRoleForm] = useState({
        role: '',
    });

    const [enrollmentForm, setEnrollmentForm] = useState({
        module_id: '',
    });

    const [selectedUserToChangeRole, setSelectedUserToChangeRole] = useState(null);

    // Use data from server props
    const stats = dashboardData?.stats || {};
    const enrollments = dashboardData?.enrollments || [];
    const loading = false;
    const error = null;

    // Listen for page refresh to update modules list
    useEffect(() => {
        if (dashboardData?.modules) {
            setModules(dashboardData.modules);
        }
    }, [dashboardData?.modules]);

    // Filter and update teachers list
    // Handle module creation
    const handleCreateModule = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.post(
            '/admin/modules',
            moduleForm,
            {
                onSuccess: () => {
                    setModuleForm({ name: '', description: '' });
                    setShowCreateModuleModal(false);
                    setFormSuccess('Module created successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error creating module:', errors);
                    setFormError(errors.name || errors.description || 'Failed to create module');
                    setFormLoading(false);
                },
            }
        );
    };

    // Handle teacher assignment
    const handleAssignTeacher = async (e) => {
        e.preventDefault();
        if (!selectedModule) return;
        if (!assignTeacherForm.teacher_id) {
            setFormError('Please select a teacher');
            return;
        }

        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.patch(
            `/admin/modules/${selectedModule.id}/assign-teacher`,
            assignTeacherForm,
            {
                onSuccess: () => {
                    setFormLoading(false);
                    setAssignTeacherForm({ teacher_id: '' });
                    setShowAssignTeacherModal(false);
                    setSelectedModule(null);
                    setFormSuccess('Teacher assigned successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                    // Reload the page to get fresh data
                    setTimeout(() => {
                        router.visit('/dashboard', { method: 'get' });
                    }, 500);
                },
                onError: (errors) => {
                    console.error('Error assigning teacher:', errors);
                    setFormLoading(false);
                    setFormError(errors.teacher_id || 'Failed to assign teacher');
                },
            }
        );
    };

    // Handle user deletion
    const handleDeleteUser = (e) => {
        e.preventDefault();
        if (!selectedUserToDelete) return;

        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.delete(
            `/admin/users/${selectedUserToDelete.id}`,
            {
                onSuccess: () => {
                    setShowDeleteUserModal(false);
                    setSelectedUserToDelete(null);
                    setFormSuccess('User deleted successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error deleting user:', errors);
                    setFormError(errors.message || 'Failed to delete user');
                    setFormLoading(false);
                },
            }
        );
    };

    // Handle module status toggle
    const handleToggleModuleStatus = (moduleId, isActive) => {
        setTogglingModule(moduleId);

        router.patch(
            `/admin/modules/${moduleId}/toggle-status`,
            {},
            {
                onSuccess: () => {
                    setTogglingModule(null);
                    setFormSuccess(`Module ${!isActive ? 'activated' : 'deactivated'} successfully!`);
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error toggling module status:', errors);
                    setFormError('Failed to toggle module status');
                    setTogglingModule(null);
                },
            }
        );
    };

    // Handle teacher deletion
    const handleDeleteTeacher = (e) => {
        e.preventDefault();
        if (!selectedTeacherToDelete) return;

        setDeletingTeacher(selectedTeacherToDelete.id);
        setFormError(null);
        setFormSuccess(null);

        router.delete(
            `/admin/teachers/${selectedTeacherToDelete.id}`,
            {
                onSuccess: () => {
                    setShowDeleteTeacherModal(false);
                    setSelectedTeacherToDelete(null);
                    setDeletingTeacher(null);
                    setFormSuccess('Teacher deleted successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error deleting teacher:', errors);
                    setFormError(errors.message || 'Failed to delete teacher');
                    setDeletingTeacher(null);
                },
            }
        );
    };

    // Handle add teacher
    const handleAddTeacher = (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.post(
            '/admin/teachers',
            addTeacherForm,
            {
                onSuccess: () => {
                    setAddTeacherForm({
                        name: '',
                        email: '',
                        password: '',
                        password_confirmation: '',
                    });
                    setShowAddTeacherModal(false);
                    setFormSuccess('Teacher account created successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error creating teacher:', errors);
                    setFormError(errors.email || errors.name || errors.password || 'Failed to create teacher');
                    setFormLoading(false);
                },
            }
        );
    };

    // Handle change user role
    const handleChangeRole = (e) => {
        e.preventDefault();
        if (!selectedUserToChangeRole) return;

        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.patch(
            `/admin/users/${selectedUserToChangeRole.id}/change-role`,
            changeRoleForm,
            {
                onSuccess: () => {
                    setChangeRoleForm({ role: '' });
                    setShowChangeRoleModal(false);
                    setSelectedUserToChangeRole(null);
                    setFormSuccess('User role updated successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error changing role:', errors);
                    setFormError(errors.role || 'Failed to change user role');
                    setFormLoading(false);
                },
            }
        );
    };

    // Handle student enrollment
    const handleEnrollStudent = (e) => {
        e.preventDefault();
        if (!selectedStudentToEnroll || !enrollmentForm.module_id) return;

        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.post(
            '/admin/enroll-student',
            {
                student_id: selectedStudentToEnroll.id,
                module_id: enrollmentForm.module_id,
            },
            {
                onSuccess: () => {
                    setFormSuccess('Student enrolled successfully!');
                    setShowEnrollStudentModal(false);
                    setSelectedStudentToEnroll(null);
                    setEnrollmentForm({ module_id: '' });
                    setTimeout(() => setFormSuccess(null), 3000);
                    setFormLoading(false);
                },
                onError: (errors) => {
                    console.error('Error enrolling student:', errors);
                    setFormError(errors.module_id || 'Failed to enroll student');
                    setFormLoading(false);
                },
            }
        );
    };

    // Get teachers list
    const teachers = users.filter(u => u.role === 'TEACHER');

    const getRoleBadgeColor = (role) => {
        const colors = {
            ADMIN: 'text-red-600',
            TEACHER: 'text-blue-600',
            STUDENT: 'text-green-600',
            OLD_STUDENT: 'text-gray-600',
        };
        return colors[role] || 'text-gray-600';
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-5xl font-bold text-white drop-shadow-lg">
                            Admin Dashboard
                        </h2>
                        <p className="text-indigo-100 mt-2 text-lg">Manage your platform efficiently</p>
                    </div>
                    <div className="text-right bg-white bg-opacity-10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white border-opacity-20">
                        <p className="text-indigo-100 text-sm font-medium">Welcome back</p>
                        <p className="text-white text-2xl font-bold">{user?.name}</p>
                    </div>
                </div>
            }
            headerBackground="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
        >
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-slate-950 py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    {!error && stats && (
                        <>
                            {/* Statistics Cards - Modern Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Total Users Card */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-4xl">👥</span>
                                            <div className="p-2 bg-indigo-500 bg-opacity-20 rounded-lg">
                                                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium mb-1">Total Users</p>
                                        <p className="text-4xl font-bold text-white mb-2">{stats.totalUsers}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${Math.min((stats.activeUsers / stats.totalUsers) * 100, 100)}%` }}></div>
                                            </div>
                                            <span className="text-xs text-indigo-400 font-semibold">{stats.activeUsers} active</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Modules Card */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-4xl">📚</span>
                                            <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium mb-1">Active Modules</p>
                                        <p className="text-4xl font-bold text-white mb-2">{stats.activeModules}</p>
                                        <div className="text-xs text-blue-400 font-semibold">Courses available</div>
                                    </div>
                                </div>

                                {/* Enrollments Card */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-700 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-4xl">✅</span>
                                            <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium mb-1">Enrollments</p>
                                        <p className="text-4xl font-bold text-white mb-2">{stats.totalEnrollments}</p>
                                        <div className="text-xs text-green-400 font-semibold">Completion: {stats.completionRate}%</div>
                                    </div>
                                </div>

                                {/* Active Teachers Card */}
                                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-3xl"></div>
                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-4xl">👨‍🏫</span>
                                            <div className="p-2 bg-purple-500 bg-opacity-20 rounded-lg">
                                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium mb-1">Active Teachers</p>
                                        <p className="text-4xl font-bold text-white mb-2">{stats.activeTeachers}</p>
                                        <div className="text-xs text-purple-400 font-semibold">Teaching faculty</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Navigation - Modern Style */}
                            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                                <div className="flex border-b border-slate-700 overflow-x-auto bg-slate-900 p-2">
                                    {['overview', 'modules', 'users', 'teachers'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-3 font-semibold transition-all duration-300 whitespace-nowrap rounded-lg mx-1 ${
                                                activeTab === tab
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                            }`}
                                        >
                                            {tab === 'overview' && '📊 Overview'}
                                            {tab === 'modules' && '📚 Modules'}
                                            {tab === 'users' && '👥 Users'}
                                            {tab === 'teachers' && '👨‍🏫 Teachers'}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-8 bg-gradient-to-b from-slate-800 to-slate-900">
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Recent Activity */}
                                                <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 border-b border-slate-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                                                <span className="text-xl">📋</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 space-y-4">
                                                        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors">
                                                            <span className="text-2xl">✅</span>
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">New user registered</p>
                                                                <p className="text-xs text-slate-400 mt-1">John Doe joined today</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-green-500 transition-colors">
                                                            <span className="text-2xl">🎓</span>
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">New module created</p>
                                                                <p className="text-xs text-slate-400 mt-1">Advanced Python course</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors">
                                                            <span className="text-2xl">👨‍🏫</span>
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">Teacher assigned</p>
                                                                <p className="text-xs text-slate-400 mt-1">Dr. Smith → React Basics</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-orange-500 transition-colors">
                                                            <span className="text-2xl">📊</span>
                                                            <div>
                                                                <p className="text-sm font-semibold text-white">New enrollment</p>
                                                                <p className="text-xs text-slate-400 mt-1">5 students enrolled</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* System Health */}
                                                <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 border-b border-slate-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                                                <span className="text-xl">⚡</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-white">System Health</h3>
                                                        </div>
                                                    </div>
                                                    <div className="p-6 space-y-6">
                                                        <div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="text-sm font-semibold text-slate-300">Database Status</span>
                                                                <span className="text-sm font-bold bg-emerald-500 bg-opacity-20 text-emerald-400 px-3 py-1 rounded-full">98%</span>
                                                            </div>
                                                            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '98%' }}></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="text-sm font-semibold text-slate-300">API Response</span>
                                                                <span className="text-sm font-bold bg-blue-500 bg-opacity-20 text-blue-400 px-3 py-1 rounded-full">95ms</span>
                                                            </div>
                                                            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '95%' }}></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="text-sm font-semibold text-slate-300">Server Load</span>
                                                                <span className="text-sm font-bold bg-amber-500 bg-opacity-20 text-amber-400 px-3 py-1 rounded-full">65%</span>
                                                            </div>
                                                            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '65%' }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'modules' && (
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setShowCreateModuleModal(true)}
                                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                                            >
                                                + Create New Module
                                            </button>
                                            {modules.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <p className="text-slate-400">No modules available</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {modules.map((module) => (
                                                        <div
                                                            key={module.id}
                                                            className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                                                                module.is_active
                                                                    ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20'
                                                                    : 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20'
                                                            }`}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <p className="font-semibold text-white">{module.name}</p>
                                                                    <span
                                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                            module.is_active
                                                                                ? 'bg-green-500 bg-opacity-20 text-green-300'
                                                                                : 'bg-red-500 bg-opacity-20 text-red-300'
                                                                        }`}
                                                                    >
                                                                        {module.is_active ? '✓ Active' : '✕ Inactive'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-400 mt-2">
                                                                    <span className="text-slate-300">Teacher:</span> {module.teacher_name} • <span className="text-slate-300">{module.student_count}</span> students • <span className="text-slate-300">Created</span> {formatDate(module.created_at)}
                                                                </p>
                                                                {module.description && (
                                                                    <p className="text-xs text-slate-400 mt-2 line-clamp-1">{module.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-4">
                                                                <button
                                                                    onClick={() => handleToggleModuleStatus(module.id, module.is_active)}
                                                                    disabled={togglingModule === module.id}
                                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                                                        module.is_active
                                                                            ? 'bg-orange-600 bg-opacity-80 text-white hover:bg-opacity-100 disabled:opacity-50'
                                                                            : 'bg-green-600 bg-opacity-80 text-white hover:bg-opacity-100 disabled:opacity-50'
                                                                    }`}
                                                                >
                                                                    {togglingModule === module.id ? 'Updating...' : module.is_active ? 'Deactivate' : 'Activate'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedModule(module);
                                                                        setShowAssignTeacherModal(true);
                                                                    }}
                                                                    className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 text-sm font-medium transition-all duration-300"
                                                                >
                                                                    {module.teacher_name === 'Unassigned' ? 'Assign' : 'Change'} Teacher
                                                                </button>
                                                                <button
                                                                    onClick={() => handleViewStudents(module)}
                                                                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium transition-all duration-300"
                                                                >
                                                                    View Students
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {/* View Students Modal */}
                                            {showViewStudentsModal && (
                                                <ModalWrapper isOpen={showViewStudentsModal} onClose={() => setShowViewStudentsModal(false)}>
                                                    <div className="p-6">
                                                        <h3 className="text-lg font-bold mb-4">Students in {viewModule?.name}</h3>
                                                        {studentsInModule.length === 0 ? (
                                                            <p className="text-slate-400">No students enrolled in this module.</p>
                                                        ) : (
                                                            <ul className="divide-y divide-slate-700">
                                                                {studentsInModule.map(student => (
                                                                    <li key={student.id} className="flex items-center justify-between py-2">
                                                                        <span>{student.name} <span className="text-xs text-slate-400">({student.email})</span></span>
                                                                        <button
                                                                            onClick={() => handleRemoveStudent(student.id)}
                                                                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                                                                            disabled={formLoading}
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        <div className="mt-4 flex justify-end">
                                                            <button
                                                                onClick={() => setShowViewStudentsModal(false)}
                                                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                        {formError && <div className="text-red-500 mt-2">{formError}</div>}
                                                        {formSuccess && <div className="text-green-500 mt-2">{formSuccess}</div>}
                                                    </div>
                                                </ModalWrapper>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'users' && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-bold text-white">User Management</h3>
                                            {users.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <p className="text-slate-400">No users available</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {users.map((userItem) => (
                                                        <div
                                                            key={userItem.id}
                                                            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                                        {userItem.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-white">{userItem.name}</p>
                                                                        <p className="text-sm text-slate-400">{userItem.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-xs text-slate-400">Joined {formatDate(userItem.created_at)}</span>
                                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                                                                        {userItem.role}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {userItem.role === 'STUDENT' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedStudentToEnroll(userItem);
                                                                            setEnrollmentForm({ module_id: '' });
                                                                            setShowEnrollStudentModal(true);
                                                                        }}
                                                                        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 text-sm font-medium transition-all duration-300"
                                                                    >
                                                                        📚 Enroll
                                                                    </button>
                                                                )}
                                                                {userItem.role !== 'ADMIN' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedUserToChangeRole(userItem);
                                                                                setChangeRoleForm({ role: userItem.role });
                                                                                setShowChangeRoleModal(true);
                                                                            }}
                                                                            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 text-sm font-medium transition-all duration-300"
                                                                        >
                                                                            Change Role
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedUserToDelete(userItem);
                                                                                setShowDeleteUserModal(true);
                                                                            }}
                                                                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'teachers' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">Teacher Management</h3>
                                                    <p className="text-sm text-slate-400 mt-1">Total Teachers: <span className="text-indigo-400 font-semibold">{teachers.length}</span></p>
                                                </div>
                                                <button
                                                    onClick={() => setShowAddTeacherModal(true)}
                                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                                                >
                                                    + Add Teacher
                                                </button>
                                            </div>
                                            {teachers.length === 0 ? (
                                                <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                                                    <p className="text-slate-400 text-lg">No teachers available</p>
                                                    <p className="text-slate-500 text-sm mt-2">Click "Add Teacher" button above to create your first teacher</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {teachers.map((teacher) => (
                                                        <div
                                                            key={teacher.id}
                                                            className="group rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-cyan-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300"
                                                        >
                                                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-cyan-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                                                            <div className="relative p-6 space-y-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                                        {teacher.name.charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-white">{teacher.name}</p>
                                                                        <p className="text-xs text-slate-400">{teacher.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="pt-2 border-t border-slate-700">
                                                                    <p className="text-xs text-slate-400">
                                                                        <span className="text-slate-300">Joined:</span> {formatDate(teacher.created_at)}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedTeacherToDelete(teacher);
                                                                        setShowDeleteTeacherModal(true);
                                                                    }}
                                                                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
                                                                >
                                                                    Remove Teacher
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            
                        </div>
                    </>
                )}
                </div>
            </div>

            {/* Create Module Modal */}
            <ModalWrapper
                isOpen={showCreateModuleModal}
                title="Create New Module"
                onClose={() => {
                    setShowCreateModuleModal(false);
                    setFormError(null);
                    setModuleForm({ name: '', description: '' });
                }}
            >
                <form onSubmit={handleCreateModule} className="p-6 space-y-4">
                    <FormMessages error={formError} success={formSuccess} />
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-700 text-sm mb-2">
                        <strong>Note:</strong> Each module can have a maximum of <b>10 students</b> enrolled.
                    </div>
                    <FormField
                        label="Module Name"
                        value={moduleForm.name}
                        onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                        placeholder="e.g., Advanced React"
                        required
                    />
                    <FormField
                        label="Description"
                        value={moduleForm.description}
                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                        placeholder="Module description..."
                        textarea
                        rows={3}
                    />
                    <FormButtons
                        submitText="Create Module"
                        isLoading={formLoading}
                        onCancel={() => {
                            setShowCreateModuleModal(false);
                            setFormError(null);
                            setModuleForm({ name: '', description: '' });
                        }}
                    />
                </form>
            </ModalWrapper>

            {/* Assign Teacher Modal */}
            <ModalWrapper
                isOpen={showAssignTeacherModal && selectedModule}
                title="Assign Teacher"
                onClose={() => {
                    setShowAssignTeacherModal(false);
                    setFormError(null);
                    setAssignTeacherForm({ teacher_id: '' });
                    setSelectedModule(null);
                }}
            >
                <form onSubmit={handleAssignTeacher} className="p-6 space-y-4">
                    <FormMessages error={formError} success={formSuccess} />
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Module:</span> {selectedModule?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Current Teacher:</span> {selectedModule?.teacher_name}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Teacher
                        </label>
                        {users.filter((u) => u.role === 'TEACHER').length === 0 ? (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600 text-sm">
                                No teachers available. Please create teacher accounts first.
                            </div>
                        ) : (
                            <select
                                value={assignTeacherForm.teacher_id}
                                onChange={(e) => setAssignTeacherForm({ teacher_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                required
                            >
                                <option value="">-- Choose a teacher --</option>
                                {users
                                    .filter((u) => u.role === 'TEACHER')
                                    .map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name} ({teacher.email})
                                        </option>
                                    ))}
                            </select>
                        )}
                    </div>
                    <FormButtons
                        submitText="Assign Teacher"
                        isLoading={formLoading}
                        disabled={!assignTeacherForm.teacher_id}
                        onCancel={() => {
                            setShowAssignTeacherModal(false);
                            setFormError(null);
                            setAssignTeacherForm({ teacher_id: '' });
                            setSelectedModule(null);
                        }}
                    />
                </form>
            </ModalWrapper>

            {/* Delete User Confirmation Modal */}
            <ModalWrapper
                isOpen={showDeleteUserModal && selectedUserToDelete}
                title="Delete User"
                onClose={() => {
                    setShowDeleteUserModal(false);
                    setSelectedUserToDelete(null);
                    setFormError(null);
                }}
            >
                <form onSubmit={handleDeleteUser} className="p-6 space-y-4">
                    <FormMessages error={formError} success={formSuccess} />
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold text-gray-900">Warning!</p>
                                <p className="text-sm text-gray-700 mt-1">
                                    This action will permanently delete the user account and all associated data.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">User:</span> {selectedUserToDelete?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Email:</span> {selectedUserToDelete?.email}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Role:</span> {selectedUserToDelete?.role}
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                    <FormButtons
                        submitText="Delete User"
                        isLoading={formLoading}
                        onCancel={() => {
                            setShowDeleteUserModal(false);
                            setSelectedUserToDelete(null);
                            setFormError(null);
                        }}
                    />
                </form>
            </ModalWrapper>

            {/* Change Role Modal */}
            <ModalWrapper
                isOpen={showChangeRoleModal && selectedUserToChangeRole}
                title="Change User Role"
                onClose={() => {
                    setShowChangeRoleModal(false);
                    setSelectedUserToChangeRole(null);
                    setChangeRoleForm({ role: '' });
                    setFormError(null);
                }}
            >
                <form onSubmit={handleChangeRole} className="p-6 space-y-4">
                    <FormMessages error={formError} success={formSuccess} />
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">User:</span> {selectedUserToChangeRole?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Current Role:</span> {selectedUserToChangeRole?.role}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select New Role
                        </label>
                        <select
                            value={changeRoleForm.role}
                            onChange={(e) => setChangeRoleForm({ role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                        >
                            <option value="">-- Choose a role --</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="STUDENT">Student</option>
                            <option value="OLD_STUDENT">Alumni</option>
                        </select>
                    </div>
                    <FormButtons
                        submitText="Change Role"
                        isLoading={formLoading}
                        disabled={!changeRoleForm.role}
                        onCancel={() => {
                            setShowChangeRoleModal(false);
                            setSelectedUserToChangeRole(null);
                            setChangeRoleForm({ role: '' });
                            setFormError(null);
                        }}
                    />
                </form>
            </ModalWrapper>

            {/* Add Teacher Modal */}
            <ModalWrapper
                isOpen={showAddTeacherModal}
                title="Add New Teacher"
                onClose={() => {
                    setShowAddTeacherModal(false);
                    setFormError(null);
                    setAddTeacherForm({
                        name: '',
                        email: '',
                        password: '',
                        password_confirmation: '',
                    });
                }}
            >
                <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
                    <FormMessages error={formError} success={formSuccess} />
                    <FormField
                        label="Full Name"
                        value={addTeacherForm.name}
                        onChange={(e) => setAddTeacherForm({ ...addTeacherForm, name: e.target.value })}
                        placeholder="e.g., Dr. John Smith"
                        required
                    />
                    <FormField
                        label="Email Address"
                        type="email"
                        value={addTeacherForm.email}
                        onChange={(e) => setAddTeacherForm({ ...addTeacherForm, email: e.target.value })}
                        placeholder="teacher@example.com"
                        required
                    />
                    <FormField
                        label="Password"
                        type="password"
                        value={addTeacherForm.password}
                        onChange={(e) => setAddTeacherForm({ ...addTeacherForm, password: e.target.value })}
                        placeholder="Minimum 8 characters"
                        required
                    />
                    <FormField
                        label="Confirm Password"
                        type="password"
                        value={addTeacherForm.password_confirmation}
                        onChange={(e) => setAddTeacherForm({ ...addTeacherForm, password_confirmation: e.target.value })}
                        placeholder="Re-enter password"
                        required
                    />
                    <FormButtons
                        submitText="Add Teacher"
                        isLoading={formLoading}
                        onCancel={() => {
                            setShowAddTeacherModal(false);
                            setFormError(null);
                            setAddTeacherForm({
                                name: '',
                                email: '',
                                password: '',
                                password_confirmation: '',
                            });
                        }}
                    />
                </form>
            </ModalWrapper>

            {/* Delete Teacher Confirmation Modal */}
            <ModalWrapper
                isOpen={showDeleteTeacherModal && selectedTeacherToDelete}
                title="Remove Teacher"
                onClose={() => {
                    setShowDeleteTeacherModal(false);
                    setSelectedTeacherToDelete(null);
                    setFormError(null);
                }}
            >
                <form onSubmit={handleDeleteTeacher} className="p-6 space-y-4">
                    <FormMessages error={formError} success={formSuccess} />
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-semibold text-gray-900">Remove Teacher</p>
                                <p className="text-sm text-gray-700 mt-1">
                                    This teacher will be unassigned from all their modules. The modules will remain active.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Teacher:</span> {selectedTeacherToDelete?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Email:</span> {selectedTeacherToDelete?.email}
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        Are you sure you want to remove this teacher? This action cannot be undone.
                    </p>
                    <FormButtons
                        submitText="Remove Teacher"
                        isLoading={deletingTeacher !== null}
                        onCancel={() => {
                            setShowDeleteTeacherModal(false);
                            setSelectedTeacherToDelete(null);
                            setFormError(null);
                        }}
                    />
                </form>
            </ModalWrapper>

            {/* Enroll Student Modal */}
            <ModalWrapper
                isOpen={showEnrollStudentModal && selectedStudentToEnroll}
                title="Enroll Student in Module"
                onClose={() => {
                    setShowEnrollStudentModal(false);
                    setSelectedStudentToEnroll(null);
                    setEnrollmentForm({ module_id: '' });
                    setFormError(null);
                }}
            >
                <form onSubmit={handleEnrollStudent} className="p-6 space-y-4">
                    <FormMessages error={formError} success={formSuccess} />
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">Student:</span> {selectedStudentToEnroll?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">Email:</span> {selectedStudentToEnroll?.email}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Module
                        </label>
                        {modules.length === 0 ? (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600 text-sm">
                                No modules available. Please create modules first.
                            </div>
                        ) : (
                            <select
                                value={enrollmentForm.module_id}
                                onChange={(e) => setEnrollmentForm({ module_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                required
                            >
                                <option value="">-- Choose a module --</option>
                                {modules.map((module) => (
                                    <option key={module.id} value={module.id}>
                                        {module.name} {!module.is_active && '(Inactive)'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <FormButtons
                        submitText="Enroll Student"
                        isLoading={formLoading}
                        disabled={!enrollmentForm.module_id}
                        onCancel={() => {
                            setShowEnrollStudentModal(false);
                            setSelectedStudentToEnroll(null);
                            setEnrollmentForm({ module_id: '' });
                            setFormError(null);
                        }}
                    />
                </form>
            </ModalWrapper>
        </AuthenticatedLayout>
    );
}


