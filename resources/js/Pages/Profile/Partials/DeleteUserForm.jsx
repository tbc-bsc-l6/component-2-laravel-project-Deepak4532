import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <p className="text-slate-300 text-sm leading-relaxed">
                Once your account is deleted, all of its resources and data will be permanently deleted. This action cannot be undone. Please download any important data before proceeding.
            </p>

            <button
                onClick={confirmUserDeletion}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20"
            >
                Delete My Account
            </button>

            {/* Confirmation Modal */}
            {confirmingUserDeletion && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-lg font-bold text-red-300 flex items-center gap-2">
                                <span className="text-xl">⚠️</span>
                                Confirm Account Deletion
                            </h3>
                        </div>

                        <form onSubmit={deleteUser} className="p-6 space-y-6">
                            <div>
                                <p className="text-slate-200 font-medium mb-2">
                                    Are you absolutely sure?
                                </p>
                                <p className="text-slate-400 text-sm">
                                    This action is permanent and cannot be undone. All your data will be deleted immediately.
                                </p>
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Enter your password to confirm"
                                    className="text-slate-200 mb-2"
                                />

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="block w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors duration-200 border border-slate-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                                >
                                    {processing ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
