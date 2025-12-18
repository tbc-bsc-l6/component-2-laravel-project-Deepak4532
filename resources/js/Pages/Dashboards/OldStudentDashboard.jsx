import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function OldStudentDashboard({ user }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Completed Courses
                </h2>
            }
        >
            <Head title="Old Student Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-6 text-lg font-semibold">Welcome, {user?.name}</h3>
                            
                            <div className="mb-6 rounded-lg bg-blue-50 p-4">
                                <p className="text-blue-900">
                                    You have completed all your course enrollments. Your account has been marked as an Old Student.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h4 className="mb-4 font-semibold">Your Completed Courses</h4>
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-gray-200 p-4">
                                        <h5 className="font-semibold">Course history will appear here</h5>
                                        <p className="text-sm text-gray-600">Your completed and graded courses will be displayed in this section</p>
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs text-gray-500">• View your final grades</p>
                                            <p className="text-xs text-gray-500">• Download certificates</p>
                                            <p className="text-xs text-gray-500">• Access course materials (read-only)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <h4 className="mb-2 font-semibold text-gray-900">Need Help?</h4>
                                <p className="text-sm text-gray-600">
                                    Contact administration if you have questions about your completed courses or wish to re-enroll.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
