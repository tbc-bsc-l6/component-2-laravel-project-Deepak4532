import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function OldStudentDashboard({ user, dashboardData }) {
    const [completedCourses, setCompletedCourses] = useState(dashboardData?.completedEnrollments || []);

    useEffect(() => {
        if (dashboardData?.completedEnrollments) {
            setCompletedCourses(dashboardData.completedEnrollments);
        }
    }, [dashboardData]);

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status) => {
        if (status === 'PASS') return { text: '✓ PASS', bg: 'bg-green-500 bg-opacity-20', text_color: 'text-green-300' };
        if (status === 'FAIL') return { text: '✗ FAIL', bg: 'bg-red-500 bg-opacity-20', text_color: 'text-red-300' };
        return { text: 'COMPLETED', bg: 'bg-blue-500 bg-opacity-20', text_color: 'text-blue-300' };
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white drop-shadow-lg">📚 Completed Courses</h2>
                        <p className="text-sm text-slate-300 mt-1">View your course history and academic record</p>
                    </div>
                    <div className="text-right bg-white bg-opacity-10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white border-opacity-20">
                        <p className="text-sm text-slate-300">Welcome back,</p>
                        <p className="text-lg font-semibold text-white">{user?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title="Completed Courses" />

            <div className="py-12 bg-slate-950 min-h-screen">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Information Card */}
                    <div className="mb-8 rounded-2xl bg-blue-500 bg-opacity-20 border border-blue-500 p-6">
                        <p className="text-blue-300 font-semibold">ℹ️ Alumni Status</p>
                        <p className="text-blue-200 text-sm mt-2">
                            You have completed all your course enrollments. Your account has been marked as an alumni/old student. You can view your complete academic history below.
                        </p>
                    </div>

                    {/* Statistics Card */}
                    <div className="mb-8">
                        <div className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-emerald-500 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 p-6">
                            <div className="absolute inset-0 -top-20 -right-20 w-40 h-40 bg-emerald-500 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Completed Courses</p>
                                    <p className="text-4xl font-bold text-white mt-2">{completedCourses.length}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-green-400 text-sm font-semibold">
                                            ✓ Passed: {completedCourses.filter(e => e.status === 'PASS').length}
                                        </span>
                                        <span className="text-red-400 text-sm font-semibold">
                                            ✗ Failed: {completedCourses.filter(e => e.status === 'FAIL').length}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-emerald-500 bg-opacity-20 rounded-xl text-5xl">🎓</div>
                            </div>
                        </div>
                    </div>

                    {/* Completed Courses Table */}
                    <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-xl">
                        {completedCourses.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-slate-400 text-lg">No completed courses</p>
                                <p className="text-slate-500 text-sm mt-2">Your completed course history will appear here</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-700 border-b border-slate-600">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">Course Name</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">Description</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">Teacher</th>
                                            <th className="px-6 py-3 text-left text-sm font-semibold text-white">Completed Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {completedCourses.map((course) => {
                                            const badge = getStatusBadge(course.status);
                                            return (
                                                <tr key={course.id} className="hover:bg-slate-700 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-semibold text-white">{course.module?.name}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-400 line-clamp-2">{course.module?.description}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text_color}`}>
                                                            {badge.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-300">{course.module?.teacher_name || 'Unassigned'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-slate-400">{formatDate(course.updated_at)}</p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer Help Section */}
                    <div className="mt-8 rounded-2xl bg-slate-800 border border-slate-700 p-6">
                        <h4 className="font-semibold text-white mb-2">Need Assistance?</h4>
                        <p className="text-slate-300 text-sm">
                            For questions about your completed courses, certificates, or academic records, please contact the administration.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
