import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
                        👤
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                        My Profile
                    </h2>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Profile Information Card */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="border-b border-slate-700/50 pb-4 mb-6">
                            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                                <span className="text-xl">✏️</span>
                                Profile Information
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Update your account details and email address</p>
                        </div>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>

                    {/* Password Update Card */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="border-b border-slate-700/50 pb-4 mb-6">
                            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                                <span className="text-xl">🔐</span>
                                Security
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Keep your account secure with a strong password</p>
                        </div>
                        <UpdatePasswordForm className="max-w-2xl" />
                    </div>

                    {/* Delete Account Card */}
                    <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 border border-red-700/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="border-b border-red-700/30 pb-4 mb-6">
                            <h3 className="text-lg font-semibold text-red-300 flex items-center gap-2">
                                <span className="text-xl">⚠️</span>
                                Danger Zone
                            </h3>
                            <p className="text-red-200/60 text-sm mt-1">Permanently delete your account and all associated data</p>
                        </div>
                        <DeleteUserForm className="max-w-2xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
