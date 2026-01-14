import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full">
                {/* EduHub Branding */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                            <span className="text-xl font-bold">📚</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">EduHub</span>
                    </Link>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-8 py-8 shadow-xl backdrop-blur-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
