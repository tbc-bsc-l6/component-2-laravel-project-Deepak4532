import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome - EduHub" />
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                </div>

                <div className="relative z-10">
                    {/* Header */}
                    <header className="border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex justify-between items-center">
                                <a href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                                        <span className="text-lg font-bold">📚</span>
                                    </div>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">EduHub</span>
                                </a>
                                <nav className="flex items-center gap-6">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition duration-300 font-medium shadow-lg hover:shadow-purple-500/50"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="px-6 py-2 text-slate-300 hover:text-white transition duration-300 font-medium"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition duration-300 font-medium shadow-lg hover:shadow-purple-500/50"
                                            >
                                                Sign up
                                            </Link>
                                        </>
                                    )}
                                </nav>
                            </div>
                        </div>
                    </header>

                    {/* Hero Section */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="text-center mb-16">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                Welcome to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">EduHub</span>
                            </h1>
                            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                                A modern educational platform empowering administrators, teachers, and students to collaborate seamlessly and achieve academic excellence.
                            </p>
                            {!auth.user && (
                                <div className="flex gap-4 justify-center">
                                    <Link
                                        href={route('register')}
                                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition duration-300 font-semibold shadow-lg hover:shadow-purple-500/50"
                                    >
                                        Get Started
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="px-8 py-3 rounded-lg border border-slate-600 hover:border-purple-500 text-slate-300 hover:text-white transition duration-300 font-semibold"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {/* Admin Feature */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition duration-500"></div>
                                <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition duration-300">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                        🎛️
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Admin Control</h3>
                                    <p className="text-slate-400 mb-4">
                                        Full system management: create modules, assign teachers, manage users, and monitor all academic activities with powerful analytics.
                                    </p>
                                    <div className="space-y-2 text-sm text-slate-300">
                                        <div className="flex items-center gap-2">✓ Module Management</div>
                                        <div className="flex items-center gap-2">✓ Teacher Assignment</div>
                                        <div className="flex items-center gap-2">✓ User Administration</div>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Feature */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition duration-500"></div>
                                <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-pink-500/50 transition duration-300">
                                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                        👨‍🏫
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Teacher Tools</h3>
                                    <p className="text-slate-400 mb-4">
                                        Manage your classes effortlessly: view enrolled students, track progress, mark completions, and create engaging assignments.
                                    </p>
                                    <div className="space-y-2 text-sm text-slate-300">
                                        <div className="flex items-center gap-2">✓ Student Management</div>
                                        <div className="flex items-center gap-2">✓ Progress Tracking</div>
                                        <div className="flex items-center gap-2">✓ Assignment Creation</div>
                                    </div>
                                </div>
                            </div>

                            {/* Student Feature */}
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-teal-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition duration-500"></div>
                                <div className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm hover:border-indigo-500/50 transition duration-300">
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
                                        👨‍🎓
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Student Portal</h3>
                                    <p className="text-slate-400 mb-4">
                                        Enroll in courses, track your academic progress, view current and completed modules, and manage your learning journey.
                                    </p>
                                    <div className="space-y-2 text-sm text-slate-300">
                                        <div className="flex items-center gap-2">✓ Course Enrollment</div>
                                        <div className="flex items-center gap-2">✓ Progress Tracking</div>
                                        <div className="flex items-center gap-2">✓ Learning Dashboard</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">4</div>
                                <div className="text-slate-400">User Roles</div>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                                <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">100%</div>
                                <div className="text-slate-400">Features</div>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent mb-2">∞</div>
                                <div className="text-slate-400">Scalability</div>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center backdrop-blur-sm">
                                <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent mb-2">24/7</div>
                                <div className="text-slate-400">Available</div>
                            </div>
                        </div>
                    </section>

                    {/* Key Features Section */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <h2 className="text-4xl font-bold mb-12 text-center">Platform Capabilities</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">📊</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                                        <p className="text-slate-400">Real-time dashboards with comprehensive statistics and insights for all user roles.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">🔐</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
                                        <p className="text-slate-400">Role-based authentication and authorization ensuring data privacy and security.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">⚡</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                                        <p className="text-slate-400">Optimized performance with modern architecture and responsive design.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">🎯</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Smart Enrollment</h3>
                                        <p className="text-slate-400">Intelligent course management with maximum capacity and duplicate prevention.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">📝</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Assignment System</h3>
                                        <p className="text-slate-400">Create, manage, and grade assignments with full submission tracking.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">✅</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                                        <p className="text-slate-400">Monitor student progress with detailed completion dates and status history.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-12 text-center backdrop-blur-sm">
                            <h2 className="text-4xl font-bold mb-6">Ready to Transform Education?</h2>
                            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                                Join thousands of educators and students using EduHub to enhance teaching and learning experiences.
                            </p>
                            {!auth.user && (
                                <Link
                                    href={route('register')}
                                    className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition duration-300 font-semibold shadow-lg hover:shadow-purple-500/50"
                                >
                                    Start Your Journey Today
                                </Link>
                            )}
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-slate-800/50 backdrop-blur-md mt-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="grid md:grid-cols-4 gap-8 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">EduHub</h3>
                                    <p className="text-slate-400">Empowering education through modern technology.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">Features</h4>
                                    <ul className="space-y-2 text-slate-400">
                                        <li><a href="#" className="hover:text-white transition">For Admins</a></li>
                                        <li><a href="#" className="hover:text-white transition">For Teachers</a></li>
                                        <li><a href="#" className="hover:text-white transition">For Students</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">Company</h4>
                                    <ul className="space-y-2 text-slate-400">
                                        <li><a href="#" className="hover:text-white transition">About</a></li>
                                        <li><a href="#" className="hover:text-white transition">Contact</a></li>
                                        <li><a href="#" className="hover:text-white transition">Support</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3">Legal</h4>
                                    <ul className="space-y-2 text-slate-400">
                                        <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                        <li><a href="#" className="hover:text-white transition">Terms</a></li>
                                        <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
                                <p>&copy; 2026 EduHub. All rights reserved. | Laravel v{laravelVersion} | PHP v{phpVersion}</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
