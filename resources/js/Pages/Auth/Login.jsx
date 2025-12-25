import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [apiError, setApiError] = useState('');
    const [selectedRole, setSelectedRole] = useState('TEACHER');
    const [roleUsers, setRoleUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch users for the selected role
    const fetchUsersByRole = async (role) => {
        try {
            setLoadingUsers(true);
            const response = await fetch(`/api/users/by-role/${role}`);
            if (response.ok) {
                const users = await response.json();
                setRoleUsers(users);
                // Select first user by default
                if (users.length > 0) {
                    handleUserSelect(users[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Handle role change
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        fetchUsersByRole(role);
    };

    // Handle user selection and prefill credentials
    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setData({
            ...data,
            email: user.email,
            password: 'password', // Default password for all test users
        });
    };

    // Fetch users on component mount
    useEffect(() => {
        fetchUsersByRole('TEACHER');
    }, []);

    // Fetch user data after login and route to dashboard
    const fetchUserAndRoute = async () => {
        try {
            const response = await fetch('/api/user', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const user = await response.json();
                console.log('User authenticated:', user);
                
                // Route to dashboard - Inertia will pass user data via props
                router.visit('/dashboard');
            } else {
                console.error('Failed to fetch user:', response.status);
                setApiError('Failed to load user profile');
            }
        } catch (error) {
            console.error('API Error:', error);
            setApiError('Error loading user profile: ' + error.message);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setApiError('');

        post(route('login'), {
            onFinish: () => {
                reset('password');
                // Fetch user data after successful login
                setTimeout(fetchUserAndRoute, 100);
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Header Section */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back
                </h1>
                <p className="text-gray-600">
                    Sign in to your account to continue
                </p>
            </div>

            {status && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-800">
                    {status}
                </div>
            )}

            {apiError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-800">
                    {apiError}
                </div>
            )}

            {/* Role Selection Section */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Your Role
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Teacher Role */}
                    <div className="relative">
                        <input
                            type="radio"
                            id="role-teacher"
                            name="role"
                            value="TEACHER"
                            checked={selectedRole === 'TEACHER'}
                            onChange={() => handleRoleChange('TEACHER')}
                            className="peer hidden"
                        />
                        <label
                            htmlFor="role-teacher"
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-50 hover:border-blue-400 transition-all"
                        >
                            <div className="text-2xl mb-2">👨‍🏫</div>
                            <span className="text-sm font-semibold text-gray-900">
                                Teacher
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                Manage Modules
                            </span>
                        </label>
                    </div>

                    {/* Student Role */}
                    <div className="relative">
                        <input
                            type="radio"
                            id="role-student"
                            name="role"
                            value="STUDENT"
                            checked={selectedRole === 'STUDENT'}
                            onChange={() => handleRoleChange('STUDENT')}
                            className="peer hidden"
                        />
                        <label
                            htmlFor="role-student"
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-green-600 peer-checked:bg-green-50 hover:border-green-400 transition-all"
                        >
                            <div className="text-2xl mb-2">👨‍🎓</div>
                            <span className="text-sm font-semibold text-gray-900">
                                Student
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                Enroll Courses
                            </span>
                        </label>
                    </div>

                    {/* Old Student Role */}
                    <div className="relative">
                        <input
                            type="radio"
                            id="role-oldstudent"
                            name="role"
                            value="OLD_STUDENT"
                            checked={selectedRole === 'OLD_STUDENT'}
                            onChange={() => handleRoleChange('OLD_STUDENT')}
                            className="peer hidden"
                        />
                        <label
                            htmlFor="role-oldstudent"
                            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-purple-400 transition-all"
                        >
                            <div className="text-2xl mb-2">🎓</div>
                            <span className="text-sm font-semibold text-gray-900">
                                Alumnus
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                                View Courses
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Login Form */}
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="user-select" value="Select Test User" />
                    <select
                        id="user-select"
                        value={selectedUser?.id || ''}
                        onChange={(e) => {
                            const user = roleUsers.find(u => u.id == e.target.value);
                            if (user) handleUserSelect(user);
                        }}
                        className="mt-1 block w-full border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 border"
                        disabled={loadingUsers}
                    >
                        <option value="">
                            {loadingUsers ? 'Loading users...' : 'Choose a user...'}
                        </option>
                        {roleUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                    {roleUsers.length === 0 && !loadingUsers && (
                        <p className="text-xs text-red-600 mt-1">No users found for {selectedRole} role</p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="user@example.com"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                >
                    {processing ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Signing in...
                        </span>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            {/* Selected User Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">
                    📝 Selected User: {selectedUser?.name || 'None'}
                </p>
                <p className="text-xs text-blue-800">
                    <strong>Email:</strong> {selectedUser?.email || 'N/A'}
                </p>
                <p className="text-xs text-blue-800">
                    <strong>Role:</strong> {selectedUser?.role || 'N/A'}
                </p>
                <p className="text-xs text-blue-800">
                    <strong>Password:</strong> password (default test password)
                </p>
                <p className="text-xs text-blue-700 mt-2 italic">
                    💡 Select a role above and choose a user to auto-fill credentials
                </p>
            </div>

            {/* Admin Login Link */}
            <div className="mt-4 text-center">
                <a
                    href={route('admin.login')}
                    className="inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                    Are you an administrator? Login here →
                </a>
            </div>
        </GuestLayout>
    );
}
