import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function AdminDashboard({ user }) {
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
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
    const [selectedTeacherToDelete, setSelectedTeacherToDelete] = useState(null);
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

        setFormLoading(true);
        setFormError(null);
        setFormSuccess(null);

        router.patch(
            `/admin/modules/${selectedModule.id}/assign-teacher`,
            assignTeacherForm,
            {
                onSuccess: () => {
                    setAssignTeacherForm({ teacher_id: '' });
                    setShowAssignTeacherModal(false);
                    setSelectedModule(null);
                    setFormSuccess('Teacher assigned successfully!');
                    setTimeout(() => setFormSuccess(null), 3000);
                },
                onError: (errors) => {
                    console.error('Error assigning teacher:', errors);
                    setFormError(errors.teacher_id || 'Failed to assign teacher');
                    setFormLoading(false);
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
                    <h2 className="text-3xl font-bold text-gray-900">👨‍💼 Admin Dashboard</h2>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Welcome back,</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {!error && stats && (
                        <>
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">Total Users</p>
                                            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                                            <p className="text-indigo-600 text-xs mt-2">Active: {stats.activeUsers}</p>
                                        </div>
                                        <div className="text-2xl">👥</div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">Active Modules</p>
                                            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.activeModules}</p>
                                            <p className="text-blue-600 text-xs mt-2">Total modules available</p>
                                        </div>
                                        <div className="text-2xl">📚</div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">Total Enrollments</p>
                                            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalEnrollments}</p>
                                            <p className="text-green-600 text-xs mt-2">Completion: {stats.completionRate}%</p>
                                        </div>
                                        <div className="text-2xl">✅</div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm font-medium">Active Teachers</p>
                                            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.activeTeachers}</p>
                                            <p className="text-purple-600 text-xs mt-2">Teaching modules</p>
                                        </div>
                                        <div className="text-2xl">👨‍🏫</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`px-6 py-4 font-medium transition-colors ${
                                            activeTab === 'overview'
                                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        📊 Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('modules')}
                                        className={`px-6 py-4 font-medium transition-colors ${
                                            activeTab === 'modules'
                                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        📚 Modules
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('users')}
                                        className={`px-6 py-4 font-medium transition-colors ${
                                            activeTab === 'users'
                                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        👥 Users
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('teachers')}
                                        className={`px-6 py-4 font-medium transition-colors ${
                                            activeTab === 'teachers'
                                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        👨‍🏫 Teachers
                                    </button>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">📋 Recent Activity</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                                                            <span className="mr-3">✅</span>
                                                            <span className="text-sm text-gray-700">New user registered: John Doe</span>
                                                        </div>
                                                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                                                            <span className="mr-3">🎓</span>
                                                            <span className="text-sm text-gray-700">New module: Advanced Python</span>
                                                        </div>
                                                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                                                            <span className="mr-3">👨‍🏫</span>
                                                            <span className="text-sm text-gray-700">Teacher assigned: Dr. Smith</span>
                                                        </div>
                                                        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                                                            <span className="mr-3">📊</span>
                                                            <span className="text-sm text-gray-700">New enrollment: React Basics</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">🏥 System Health</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-sm font-medium text-gray-700">Database</span>
                                                                <span className="text-sm font-semibold text-green-600">98%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-sm font-medium text-gray-700">API Response</span>
                                                                <span className="text-sm font-semibold text-blue-600">95ms</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-sm font-medium text-gray-700">Server Load</span>
                                                                <span className="text-sm font-semibold text-yellow-600">65%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'modules' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">Module Management</h3>
                                                <button
                                                    onClick={() => setShowCreateModuleModal(true)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                                >
                                                    + Create Module
                                                </button>
                                            </div>
                                            {modules.length === 0 ? (
                                                <p className="text-gray-600">No modules available</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {modules.map((module) => (
                                                        <div
                                                            key={module.id}
                                                            className={`flex items-center justify-between p-4 rounded-lg border ${
                                                                module.is_active
                                                                    ? 'bg-gray-50 border-gray-200'
                                                                    : 'bg-red-50 border-red-200'
                                                            }`}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold text-gray-900">{module.name}</p>
                                                                    <span
                                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                            module.is_active
                                                                                ? 'bg-green-100 text-green-700'
                                                                                : 'bg-red-100 text-red-700'
                                                                        }`}
                                                                    >
                                                                        {module.is_active ? '✓ Active' : '✕ Inactive'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Teacher: {module.teacher_name} • {module.student_count} students • Created {formatDate(module.created_at)}
                                                                </p>
                                                                {module.description && (
                                                                    <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-4">
                                                                <button
                                                                    onClick={() => handleToggleModuleStatus(module.id, module.is_active)}
                                                                    disabled={togglingModule === module.id}
                                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                        module.is_active
                                                                            ? 'bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50'
                                                                            : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                                                                    }`}
                                                                >
                                                                    {togglingModule === module.id ? 'Updating...' : module.is_active ? 'Deactivate' : 'Activate'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedModule(module);
                                                                        setShowAssignTeacherModal(true);
                                                                    }}
                                                                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                                                >
                                                                    {module.teacher_name === 'Unassigned' ? 'Assign' : 'Change'} Teacher
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'users' && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4 text-gray-900">User Management</h3>
                                            {users.length === 0 ? (
                                                <p className="text-gray-600">No users available</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {users.map((userItem) => (
                                                        <div
                                                            key={userItem.id}
                                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900">{userItem.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    Email: {userItem.email} • Joined {formatDate(userItem.created_at)}
                                                                </p>
                                                                <p className={`text-sm font-semibold mt-1 ${getRoleBadgeColor(userItem.role)}`}>
                                                                    {userItem.role}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUserToChangeRole(userItem);
                                                                        setChangeRoleForm({ role: userItem.role });
                                                                        setShowChangeRoleModal(true);
                                                                    }}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                                                                >
                                                                    Change Role
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUserToDelete(userItem);
                                                                        setShowDeleteUserModal(true);
                                                                    }}
                                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                                                                >
                                                                    Delete User
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'teachers' && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Teacher Management</h3>
                                                    <p className="text-sm text-gray-600 mt-1">Total Teachers: {teachers.length}</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowAddTeacherModal(true)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                                >
                                                    + Add Teacher
                                                </button>
                                            </div>
                                            {teachers.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <p className="text-gray-600 text-lg">No teachers available</p>
                                                    <p className="text-gray-500 text-sm mt-2">Click "Add Teacher" button above to create your first teacher</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {teachers.map((teacher) => (
                                                        <div
                                                            key={teacher.id}
                                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                        <span className="text-blue-600 font-semibold">{teacher.name.charAt(0)}</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900">{teacher.name}</p>
                                                                        <p className="text-sm text-gray-600">{teacher.email}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    Joined: {formatDate(teacher.created_at)}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTeacherToDelete(teacher);
                                                                    setShowDeleteTeacherModal(true);
                                                                }}
                                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                                                            >
                                                                Remove
                                                            </button>
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
            {showCreateModuleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Module</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModuleModal(false);
                                    setFormError(null);
                                    setModuleForm({ name: '', description: '' });
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateModule} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {formSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Module Name
                                </label>
                                <input
                                    type="text"
                                    value={moduleForm.name}
                                    onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                                    placeholder="e.g., Advanced React"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={moduleForm.description}
                                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                    placeholder="Module description..."
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModuleModal(false);
                                        setFormError(null);
                                        setModuleForm({ name: '', description: '' });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {formLoading ? 'Creating...' : 'Create Module'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Teacher Modal */}
            {showAssignTeacherModal && selectedModule && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Assign Teacher</h3>
                            <button
                                onClick={() => {
                                    setShowAssignTeacherModal(false);
                                    setFormError(null);
                                    setAssignTeacherForm({ teacher_id: '' });
                                    setSelectedModule(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAssignTeacher} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {formSuccess}
                                </div>
                            )}

                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Module:</span> {selectedModule.name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Current Teacher:</span> {selectedModule.teacher_name}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Teacher
                                </label>
                                {teachers.length === 0 ? (
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
                                        {teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} ({teacher.email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAssignTeacherModal(false);
                                        setFormError(null);
                                        setAssignTeacherForm({ teacher_id: '' });
                                        setSelectedModule(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading || !assignTeacherForm.teacher_id}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {formLoading ? 'Assigning...' : 'Assign Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Confirmation Modal */}
            {showDeleteUserModal && selectedUserToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                            <button
                                onClick={() => {
                                    setShowDeleteUserModal(false);
                                    setSelectedUserToDelete(null);
                                    setFormError(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleDeleteUser} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {formSuccess}
                                </div>
                            )}

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
                                    <span className="font-semibold">User:</span> {selectedUserToDelete.name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Email:</span> {selectedUserToDelete.email}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Role:</span> {selectedUserToDelete.role}
                                </p>
                            </div>

                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>

                            <div className="flex gap-2 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteUserModal(false);
                                        setSelectedUserToDelete(null);
                                        setFormError(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {formLoading ? 'Deleting...' : 'Delete User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Role Modal */}
            {showChangeRoleModal && selectedUserToChangeRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Change User Role</h3>
                            <button
                                onClick={() => {
                                    setShowChangeRoleModal(false);
                                    setSelectedUserToChangeRole(null);
                                    setChangeRoleForm({ role: '' });
                                    setFormError(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleChangeRole} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {formSuccess}
                                </div>
                            )}

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">User:</span> {selectedUserToChangeRole.name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Current Role:</span> {selectedUserToChangeRole.role}
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
                                    <option value="ADMIN">Admin</option>
                                    <option value="TEACHER">Teacher</option>
                                    <option value="STUDENT">Student</option>
                                    <option value="OLD_STUDENT">Alumni</option>
                                </select>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowChangeRoleModal(false);
                                        setSelectedUserToChangeRole(null);
                                        setChangeRoleForm({ role: '' });
                                        setFormError(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading || !changeRoleForm.role}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {formLoading ? 'Updating...' : 'Change Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Teacher Modal */}
            {showAddTeacherModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Add New Teacher</h3>
                            <button
                                onClick={() => {
                                    setShowAddTeacherModal(false);
                                    setFormError(null);
                                    setAddTeacherForm({
                                        name: '',
                                        email: '',
                                        password: '',
                                        password_confirmation: '',
                                    });
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {formSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={addTeacherForm.name}
                                    onChange={(e) => setAddTeacherForm({ ...addTeacherForm, name: e.target.value })}
                                    placeholder="e.g., Dr. John Smith"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={addTeacherForm.email}
                                    onChange={(e) => setAddTeacherForm({ ...addTeacherForm, email: e.target.value })}
                                    placeholder="teacher@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={addTeacherForm.password}
                                    onChange={(e) => setAddTeacherForm({ ...addTeacherForm, password: e.target.value })}
                                    placeholder="Minimum 8 characters"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={addTeacherForm.password_confirmation}
                                    onChange={(e) => setAddTeacherForm({ ...addTeacherForm, password_confirmation: e.target.value })}
                                    placeholder="Re-enter password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTeacherModal(false);
                                        setFormError(null);
                                        setAddTeacherForm({
                                            name: '',
                                            email: '',
                                            password: '',
                                            password_confirmation: '',
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {formLoading ? 'Creating...' : 'Add Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Teacher Confirmation Modal */}
            {showDeleteTeacherModal && selectedTeacherToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Remove Teacher</h3>
                            <button
                                onClick={() => {
                                    setShowDeleteTeacherModal(false);
                                    setSelectedTeacherToDelete(null);
                                    setFormError(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleDeleteTeacher} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {formSuccess}
                                </div>
                            )}

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
                                    <span className="font-semibold">Teacher:</span> {selectedTeacherToDelete.name}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Email:</span> {selectedTeacherToDelete.email}
                                </p>
                            </div>

                            <p className="text-sm text-gray-600">
                                Are you sure you want to remove this teacher? This action cannot be undone.
                            </p>

                            <div className="flex gap-2 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteTeacherModal(false);
                                        setSelectedTeacherToDelete(null);
                                        setFormError(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={deletingTeacher !== null}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deletingTeacher !== null ? 'Removing...' : 'Remove Teacher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}


