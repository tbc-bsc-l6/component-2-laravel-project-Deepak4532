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

    // Fetch users for the selected role
    const fetchUsersByRole = async (role) => {
        try {
            const response = await fetch(`/api/users/by-role/${role}`);
            if (response.ok) {
                console.log(`Users fetched for role: ${role}`);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Handle role change
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        fetchUsersByRole(role);
    };

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

    // Fetch user data on component mount
    useEffect(() => {
        fetchUsersByRole('TEACHER');
    }, []);

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

            {/* OAuth Divider - Only show for Student and Old Student */}
            {(selectedRole === 'STUDENT' || selectedRole === 'OLD_STUDENT') && (
                <>
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-950 dark:bg-slate-900 text-slate-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Google OAuth Button */}
                        <a
                            href={route('oauth.google')}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            <span className="hidden sm:inline">Google</span>
                        </a>

                        {/* GitHub OAuth Button */}
                        <a
                            href={route('oauth.github')}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="hidden sm:inline">GitHub</span>
                        </a>
                    </div>
                </>
            )}
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
