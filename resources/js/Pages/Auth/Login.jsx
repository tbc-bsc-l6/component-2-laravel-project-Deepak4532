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
            <Head title="Log in - EduHub" />

            {/* Header Section */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome Back
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Sign in to your account to continue
                </p>
            </div>

            {status && (
                <div className="mb-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-sm font-medium text-green-400 backdrop-blur-sm">
                    {status}
                </div>
            )}

            {apiError && (
                <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-sm font-medium text-red-400 backdrop-blur-sm">
                    {apiError}
                </div>
            )}

            {/* Role Selection Section */}
            <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-300 dark:text-slate-200 mb-4">
                    Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {/* Teacher Role */}
                    <div className="relative group">
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
                            className="flex flex-col items-center justify-center p-6 border-2 border-slate-700 dark:border-slate-600 rounded-xl cursor-pointer peer-checked:border-purple-500 peer-checked:bg-purple-500/10 hover:border-purple-400 hover:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-all backdrop-blur-sm"
                        >
                            <div className="text-4xl mb-3">👨‍🏫</div>
                            <span className="text-sm font-semibold text-slate-200 dark:text-slate-300">
                                Teacher
                            </span>
                            <span className="text-xs text-slate-400 mt-1">
                                Manage Classes
                            </span>
                        </label>
                    </div>

                    {/* Student Role */}
                    <div className="relative group">
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
                            className="flex flex-col items-center justify-center p-6 border-2 border-slate-700 dark:border-slate-600 rounded-xl cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 hover:border-indigo-400 hover:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-all backdrop-blur-sm"
                        >
                            <div className="text-4xl mb-3">👨‍🎓</div>
                            <span className="text-sm font-semibold text-slate-200 dark:text-slate-300">
                                Student
                            </span>
                            <span className="text-xs text-slate-400 mt-1">
                                Enroll Courses
                            </span>
                        </label>
                    </div>

                    {/* Old Student Role */}
                    <div className="relative group">
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
                            className="flex flex-col items-center justify-center p-6 border-2 border-slate-700 dark:border-slate-600 rounded-xl cursor-pointer peer-checked:border-teal-500 peer-checked:bg-teal-500/10 hover:border-teal-400 hover:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-all backdrop-blur-sm"
                        >
                            <div className="text-4xl mb-3">🎓</div>
                            <span className="text-sm font-semibold text-slate-200 dark:text-slate-300">
                                Alumnus
                            </span>
                            <span className="text-xs text-slate-400 mt-1">
                                View History
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
                        className="mt-1 block w-full bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-purple-500 px-4 py-3 border text-slate-200 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 transition-all"
                        disabled={loadingUsers}
                    >
                        <option value="" className="bg-slate-900 text-slate-200">
                            {loadingUsers ? 'Loading users...' : 'Choose a user...'}
                        </option>
                        {roleUsers.map((user) => (
                            <option key={user.id} value={user.id} className="bg-slate-900 text-slate-200">
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                    {roleUsers.length === 0 && !loadingUsers && (
                        <p className="text-xs text-red-400 mt-1">No users found for {selectedRole} role</p>
                    )}
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-purple-500 text-slate-200 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400"
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
                        className="mt-1 block w-full bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-600 rounded-lg focus:border-purple-500 focus:ring-purple-500 text-slate-200 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-slate-400 dark:text-slate-400">
                            Remember me
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 active:scale-95"
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
            <div className="mt-8 p-4 bg-slate-800/50 dark:bg-slate-800/50 border border-purple-500/30 rounded-lg backdrop-blur-sm">
                <p className="text-xs font-semibold text-purple-300 mb-3">
                    📝 Selected User Information
                </p>
                <div className="space-y-2 text-xs text-slate-400 dark:text-slate-400">
                    <p><strong className="text-slate-300">Name:</strong> {selectedUser?.name || 'None'}</p>
                    <p><strong className="text-slate-300">Email:</strong> {selectedUser?.email || 'N/A'}</p>
                    <p><strong className="text-slate-300">Role:</strong> {selectedUser?.role || 'N/A'}</p>
                    <p><strong className="text-slate-300">Password:</strong> password (default test password)</p>
                </div>
                <p className="text-xs text-purple-400 mt-3 italic">
                    💡 Select a role above and choose a user to auto-fill credentials
                </p>
            </div>

            {/* Admin Login Link & Signup */}
            <div className="mt-6 flex items-center justify-between gap-4">
                <a
                    href={route('admin.login')}
                    className="flex-1 text-center text-sm font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                    Admin Login →
                </a>
                <p className="text-sm text-slate-400">Don't have account?</p>
                <Link
                    href={route('register')}
                    className="flex-1 text-center text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                    Sign Up →
                </Link>
            </div>
        </GuestLayout>
    );
}
