import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminDashboard from './Dashboards/AdminDashboard';
import TeacherDashboard from './Dashboards/TeacherDashboard';
import StudentDashboard from './Dashboards/StudentDashboard';
import OldStudentDashboard from './Dashboards/OldStudentDashboard';

export default function Dashboard() {
    const { auth, dashboardData } = usePage().props;
    const user = auth.user;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // User data is available via Inertia props from server
        console.log('🔍 Dashboard loaded for user:', user);
        console.log('🔍 User role:', user?.role);
        console.log('🔍 Dashboard data:', dashboardData);
        setLoading(false);
    }, [user, dashboardData]);

    // Render dashboard based on user role
    // This is mandatory for role-based UX
    if (!user) {
        return <div className="p-8">Loading user data...</div>;
    }

    // Debug log
    console.log('🎯 Rendering dashboard for role:', user.role);

    switch (user.role) {
        case 'ADMIN':
            console.log('✅ Rendering AdminDashboard');
            return <AdminDashboard user={user} />;
        case 'TEACHER':
            console.log('✅ Rendering TeacherDashboard');
            return <TeacherDashboard user={user} />;
        case 'STUDENT':
            console.log('✅ Rendering StudentDashboard');
            return <StudentDashboard user={user} dashboardData={dashboardData} />;
        case 'OLD_STUDENT':
            console.log('✅ Rendering OldStudentDashboard');
            return <OldStudentDashboard user={user} dashboardData={dashboardData} />;
        default:
            console.warn('❌ Unknown role:', user.role, '- defaulting to StudentDashboard');
            return <StudentDashboard user={user} dashboardData={dashboardData} />;
    }
}
