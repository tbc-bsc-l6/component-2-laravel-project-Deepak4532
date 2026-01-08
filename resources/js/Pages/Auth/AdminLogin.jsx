import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminLogin({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });
    const [apiError, setApiError] = useState('');

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
                
                // Check if user is admin
                if (user.role !== 'ADMIN') {
                    setApiError('Access denied. Only administrators can access this page.');
                    return;
                }
                
                // Route to admin dashboard - Inertia will pass user data via props
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
            onError: (errors) => {
                if (errors.email) {
                    setApiError(errors.email);
                } else if (errors.password) {
                    setApiError(errors.password);
                }
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Admin Login - EduHub" />

            {/* Admin Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center gap-3 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/50 transform -rotate-12">
                        <span className="text-2xl">🔐</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Admin Portal</h1>
                        <p className="text-sm text-slate-400 mt-1">Secure administrator access</p>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
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

            {/* Login Form */}
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Admin Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-600 rounded-lg focus:border-red-500 focus:ring-red-500 px-4 py-3 border text-slate-200 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 transition-all"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="admin@example.com"
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
                        className="mt-1 block w-full bg-slate-800 dark:bg-slate-800 border-slate-700 dark:border-slate-600 rounded-lg focus:border-red-500 focus:ring-red-500 px-4 py-3 border text-slate-200 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 transition-all"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/50 transform hover:scale-105 active:scale-95"
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
                        'Sign In as Admin'
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-slate-900/80 text-slate-400">Or</span>
                </div>
            </div>

            {/* Back to Regular Login */}
            <Link
                href={route('login')}
                className="w-full block text-center px-4 py-3 border-2 border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white font-semibold rounded-lg hover:bg-slate-800/50 transition-all"
            >
                Back to User Login
            </Link>

            {/* Admin Info Box */}
            <div className="mt-8 p-5 bg-slate-800/50 dark:bg-slate-800/50 border border-red-500/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <span className="text-xl mt-1">🔐</span>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-red-300 mb-3">
                            Admin Test Credentials
                        </p>
                        <div className="space-y-2 text-xs text-slate-400">
                            <div className="flex items-center justify-between">
                                <span>Email:</span>
                                <code className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 text-slate-300 font-mono">admin@example.com</code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Password:</span>
                                <code className="bg-slate-900/80 px-3 py-1 rounded border border-slate-700 text-slate-300 font-mono">password</code>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 italic">
                            ⚠️ This page is restricted to administrators only
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
