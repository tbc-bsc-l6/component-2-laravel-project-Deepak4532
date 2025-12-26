import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, router } from '@inertiajs/react';
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
            <Head title="Admin Login" />

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Admin Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-block p-3 bg-indigo-500 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
                        <p className="text-indigo-200">Secure administrator access</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                        {status && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-800">
                                {status}
                            </div>
                        )}

                        {apiError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-800">
                                {apiError}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
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
                                    className="mt-1 block w-full border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} className="mt-2" />
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
                                    'Sign In as Admin'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        {/* Back to Regular Login */}
                        <a
                            href={route('login')}
                            className="w-full block text-center px-4 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
                        >
                            Back to User Login
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-indigo-200 text-sm">
                            This page is restricted to administrators only
                        </p>
                    </div>

                    {/* Admin Info Box */}
                    <div className="mt-6 p-4 bg-indigo-900 bg-opacity-50 border border-indigo-400 rounded-lg backdrop-blur">
                        <p className="text-xs text-indigo-100 mb-2">
                            <strong>🔐 Admin Credentials (Test):</strong>
                        </p>
                        <p className="text-xs text-indigo-100">
                            Email: <code className="bg-indigo-800 px-2 py-1 rounded">admin@example.com</code>
                        </p>
                        <p className="text-xs text-indigo-100 mt-1">
                            Password: <code className="bg-indigo-800 px-2 py-1 rounded">password</code>
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
