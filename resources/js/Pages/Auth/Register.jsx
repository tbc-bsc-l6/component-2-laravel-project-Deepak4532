import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'STUDENT',
    });

    const [selectedRole, setSelectedRole] = useState('STUDENT');

    const roles = [
        {
            id: 'STUDENT',
            name: 'Student',
            description: 'Access learning modules and course materials',
            icon: '🎓',
        },
    ];

    // Set role to STUDENT on mount
    useEffect(() => {
        setData('role', 'STUDENT');
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <Head title="Register" />

            {/* Animated background blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-purple-500/50 mx-auto">
                            📚
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                        EduHub
                    </h1>
                    <p className="text-slate-400 text-sm">Create your student account</p>
                </div>

                {/* Main Card */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                    <form onSubmit={submit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" className="text-slate-200 text-sm font-medium mb-2" />
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="John Doe"
                                required
                                autoComplete="name"
                            />
                            <InputError message={errors.name} className="mt-2 text-red-400 text-sm" />
                        </div>

                        {/* Email Field */}
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-slate-200 text-sm font-medium mb-2" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                            <InputError message={errors.email} className="mt-2 text-red-400 text-sm" />
                        </div>

                        {/* Password Field */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-slate-200 text-sm font-medium mb-2" />
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password} className="mt-2 text-red-400 text-sm" />
                            <p className="text-xs text-slate-400 mt-1.5">🔒 At least 8 characters recommended</p>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-slate-200 text-sm font-medium mb-2" />
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                placeholder="••••••••"
                                required
                                autoComplete="new-password"
                            />
                            <InputError message={errors.password_confirmation} className="mt-2 text-red-400 text-sm" />
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={processing}
                            type="submit"
                            className="w-full mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span> Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    ✨ Create Account
                                </span>
                            )}
                        </button>
                    </form>

                    {/* OAuth Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-800/80 text-slate-400">
                                Or sign up with
                            </span>
                        </div>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {/* Google OAuth Button */}
                        <a
                            href={route('oauth.google')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="hidden sm:inline">GitHub</span>
                        </a>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-slate-400 text-sm">or</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center mb-6">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Your Role</p>
                        <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                            <span className="text-2xl">🎓</span>
                            <div>
                                <p className="text-slate-200 font-semibold text-sm">Student</p>
                                <p className="text-slate-400 text-xs">Access learning modules and courses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    By registering, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
