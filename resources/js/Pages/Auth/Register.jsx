import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

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
            color: 'from-green-500 to-green-600',
            badge: 'text-green-600 bg-green-100',
        },
        {
            id: 'TEACHER',
            name: 'Teacher',
            description: 'Create and manage modules, grade students',
            icon: '👨‍🏫',
            color: 'from-blue-500 to-blue-600',
            badge: 'text-blue-600 bg-blue-100',
        },
        {
            id: 'ADMIN',
            name: 'Administrator',
            description: 'Full system access and management',
            icon: '👨‍💼',
            color: 'from-red-500 to-red-600',
            badge: 'text-red-600 bg-red-100',
        },
    ];

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setData('role', role);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const currentRole = roles.find(r => r.id === selectedRole);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <Head title="Register" />

            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-6">
                        <div className="text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            📚 EduHub
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-3">Create Your Account</h1>
                    <p className="text-xl text-gray-300">Join thousands of learners on our platform</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                        {/* Left Side - Role Selection */}
                        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 flex flex-col justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                                    <span>🎯</span> Select Your Role
                                </h2>
                                <div className="space-y-4">
                                    {roles.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => handleRoleSelect(role.id)}
                                            className={`w-full p-5 rounded-xl transition-all duration-300 text-left transform hover:scale-105 ${
                                                selectedRole === role.id
                                                    ? `bg-white text-gray-900 shadow-xl ring-4 ring-white scale-105`
                                                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-4xl">{role.icon}</span>
                                                <div>
                                                    <p className="font-bold text-lg">{role.name}</p>
                                                    <p className={`text-sm ${selectedRole === role.id ? 'text-gray-600' : 'text-white/80'}`}>
                                                        {role.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Role Info Display */}
                            <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl border-2 border-white/30">
                                <p className="text-sm text-white/70 mb-3 uppercase tracking-widest">Selected Role</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{currentRole?.icon}</span>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{currentRole?.name}</p>
                                        <p className="text-white/70 text-sm">{currentRole?.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="p-12 flex flex-col justify-center bg-gray-50">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Name Field */}
                                <div>
                                    <InputLabel htmlFor="name" value="Full Name" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-3 block w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200 text-base"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="John Doe"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2 text-red-600" />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <InputLabel htmlFor="email" value="Email Address" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-3 block w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200 text-base"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2 text-red-600" />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <InputLabel htmlFor="password" value="Password" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-3 block w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200 text-base"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2 text-red-600" />
                                    <p className="text-xs text-gray-500 mt-2">🔒 At least 8 characters</p>
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-3 block w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition duration-200 text-base"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2 text-red-600" />
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6">
                                    <PrimaryButton
                                        disabled={processing}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 text-lg shadow-lg"
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
                                    </PrimaryButton>
                                </div>

                                {/* Login Link */}
                                <div className="text-center pt-6 border-t-2 border-gray-200">
                                    <p className="text-gray-600 text-base">
                                        Already have an account?{' '}
                                        <Link
                                            href={route('login')}
                                            className="text-indigo-600 font-bold hover:text-indigo-700 transition duration-200"
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-gray-400 text-sm">
                    <p>✅ By registering, you agree to our Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </div>
    );
}
