import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function StudentDashboard({ user }) {
    const [activeEnrollments, setActiveEnrollments] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const response = await fetch('/api/student/enrollments/active', {
                headers: {
                    'Accept': 'application/json',
                }
            });
            if (response.ok) {
                const data = await response.json();
                setActiveEnrollments(data.enrollments || []);
            }
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (moduleId) => {
        try {
            const response = await fetch('/api/student/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ module_id: moduleId }),
            });

            if (response.ok) {
                fetchEnrollments();
                alert('Enrolled successfully!');
            } else {
                const error = await response.json();
                alert(`Enrollment failed: ${error.message}`);
            }
        } catch (error) {
            console.error('Error enrolling:', error);
            alert('Error enrolling in module');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Student Dashboard
                </h2>
            }
        >
            <Head title="Student Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-6 text-lg font-semibold">Welcome, Student {user?.name}</h3>
                            
                            <div className="mb-8">
                                <h4 className="mb-4 font-semibold">Your Active Enrollments</h4>
                                {loading ? (
                                    <p className="text-gray-500">Loading enrollments...</p>
                                ) : activeEnrollments.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeEnrollments.map((enrollment) => (
                                            <div key={enrollment.id} className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <h5 className="font-semibold text-green-900">{enrollment.module?.name}</h5>
                                                <p className="text-sm text-green-700">{enrollment.module?.description}</p>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="text-xs text-green-600">
                                                        Started: {new Date(enrollment.start_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="inline-block rounded bg-green-200 px-2 py-1 text-xs font-semibold text-green-800">
                                                        In Progress
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">You are not enrolled in any modules yet</p>
                                )}
                            </div>

                            <div>
                                <h4 className="mb-4 font-semibold">Available Modules</h4>
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-center text-sm text-gray-600">
                                        Module listing feature coming soon...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
