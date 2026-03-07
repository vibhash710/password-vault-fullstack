import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ResetVault = () => {
    const [confirmEmail, setConfirmEmail] = useState('');
    const [understood, setUnderstood] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const handleReset = async (e) => {
        e.preventDefault();

        if (!understood) {
            toast.error('Please confirm you understand the consequences');
            return;
        }

        if (!confirmEmail) {
            toast.error('Please enter your email to confirm');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-vault', {
                confirmEmail
            });

            if (response.data.success) {
                toast.success(`Vault reset! ${response.data.passwordsDeleted} passwords deleted.`);

                // Refresh AuthContext user state
                await fetchUser();

                // Redirect to setup master password
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            console.error('Reset vault error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to reset vault';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-16 px-4">
            <div className="max-w-2xl w-full">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-xl blur"></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border-2 border-red-200 dark:border-red-800 shadow-2xl">

                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-red-900 dark:text-red-300">Reset Vault</h2>
                                    <p className="text-sm text-red-700 dark:text-red-400">Forgot your master password?</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Warning Box */}
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3 flex items-center">
                                This Action is Irreversible
                            </h3>
                            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                                    <span><strong>All your saved passwords will be permanently deleted</strong></span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                                    <span>This cannot be undone - there is no way to recover deleted passwords</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                                    <span>After reset, you'll need to set a new master password</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                                    <span>Your vault will be completely empty</span>
                                </li>
                            </ul>
                        </div>

                        {/* When to Use This */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                                Use this option if:
                            </h4>
                            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                                <li>• You've forgotten your master password and cannot access your vault</li>
                                <li>• You want to start fresh with a new master password</li>
                                <li>• You understand all your current passwords will be lost</li>
                            </ul>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleReset} className="space-y-6">
                            {/* Email Confirmation */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Confirm your email to proceed <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-slate-900 dark:text-white"
                                    required
                                />
                            </div>

                            {/* Understanding Checkbox */}
                            <div className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 rounded-lg p-4">
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        id="understood-reset"
                                        checked={understood}
                                        onChange={(e) => setUnderstood(e.target.checked)}
                                        className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 mt-0.5"
                                        required
                                    />
                                    <label htmlFor="understood-reset" className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                        <strong className="font-semibold">I understand and accept that:</strong>
                                        <ul className="mt-2 space-y-1 text-xs">
                                            <li>• All my vault passwords will be permanently deleted</li>
                                            <li>• This action cannot be undone or reversed</li>
                                            <li>• I will need to set a new master password</li>
                                            <li>• I will need to re-add all my passwords manually</li>
                                        </ul>
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !understood}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Resetting...
                                        </span>
                                    ) : (
                                        'Reset Vault & Delete All Passwords'
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetVault;