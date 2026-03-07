import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SetupMasterPassword = () => {
    const [masterPassword, setMasterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [understood, setUnderstood] = useState(false);
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    // Check if user already has master password
    useEffect(() => {
        checkMasterPasswordStatus();
    }, []);

    const checkMasterPasswordStatus = async () => {
        try {
            const response = await api.get('/auth/me');

            if (response.data.success && response.data.user.masterPasswordSet) {
                // Already has master password, redirect to vault
                navigate('/');
            }
        } catch (error) {
            console.error('Check status error:', error);
            // If not authenticated, redirect to login
            if (error.response?.status === 401) {
                navigate('/signin');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!understood) {
            toast.error('Please confirm you understand the importance of your master password');
            return;
        }

        if (masterPassword.length < 12) {
            toast.error('Master password must be at least 12 characters');
            return;
        }

        if (masterPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/set-master-password', {
                masterPassword
            });

            if (response.data.success) {
                toast.success('Master password set successfully!');

                // Refresh AuthContext user state
                await fetchUser();

                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            console.error('Set master password error:', error);
            if (error.response?.status === 429) {
                return;
            }
            toast.error(error.response?.data?.message || 'Failed to set master password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
                        Set Your Master Password
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        This password encrypts all your vault data
                    </p>
                </div>

                {/* Important Notice Box */}
                <div className="mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-xl blur opacity-75"></div>
                        <div className="relative bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
                            <div className="flex items-start space-x-3 mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3">
                                        ⚠️ Critical Information - Please Read Carefully
                                    </h3>
                                    <ul className="space-y-3 text-sm text-red-800 dark:text-red-200">
                                        <li className="flex items-start space-x-2">
                                            <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                                            <span>
                                                <strong>Your master password is NOT your login password.</strong> It's a separate password used exclusively to encrypt and decrypt your vault passwords.
                                            </span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                                            <span>
                                                <strong>You'll need this password to unlock your vault.</strong> Once unlocked, you can perform all actions until you lock it manually, refresh the page, or after 15 minutes of inactivity.
                                            </span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                                            <span>
                                                <strong>Required for vault health analysis.</strong> To analyze your passwords for security issues, you'll need to enter your master password to decrypt and check them.
                                            </span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                                            <span>
                                                <strong>This password CANNOT be recovered if forgotten.</strong> Due to end-to-end encryption, we never store or have access to your master password.
                                            </span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                                            <span>
                                                <strong>Forgetting this password means losing ALL your vault data.</strong> There is no password reset option for master passwords.
                                            </span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-red-600 dark:text-red-400 font-bold mt-0.5">•</span>
                                            <span>
                                                <strong>Write it down and store it safely.</strong> Use a physical notebook, password manager, or secure location you trust.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Practices */}
                <div className="mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Master Password Best Practices
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <li className="flex items-start space-x-2">
                                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                                    <span>Use at least 12 characters (the longer, the better)</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                                    <span>Include uppercase, lowercase, numbers, and symbols</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                                    <span>Make it memorable but unique (not used anywhere else)</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">✓</span>
                                    <span>Consider using a passphrase: "Purple!Elephant$Dancing#2024"</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Master Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Master Password <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={masterPassword}
                                    onChange={(e) => setMasterPassword(e.target.value)}
                                    placeholder="Enter a strong master password (min 12 characters)"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white"
                                    required
                                    minLength={12}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Confirm Master Password <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your master password"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white"
                                    required
                                />
                            </div>

                            {/* Show Password Toggle */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="showPassword"
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="showPassword" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                                    Show password
                                </label>
                            </div>

                            {/* Understanding Checkbox */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        id="understood"
                                        checked={understood}
                                        onChange={(e) => setUnderstood(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-0.5"
                                        required
                                    />
                                    <label htmlFor="understood" className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                        <strong className="font-semibold">I understand that:</strong>
                                        <ul className="mt-2 space-y-1 text-xs">
                                            <li>• This password cannot be recovered if forgotten</li>
                                            <li>• I will need it to unlock my vault and access passwords</li>
                                            <li>• Losing it means losing all my vault data</li>
                                            <li>• I have saved it in a secure location</li>

                                        </ul>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !understood}
                                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Setting Up...
                                    </span>
                                ) : (
                                    'Set Master Password & Continue to Vault'
                                )}
                            </button>

                            {/* Help Text */}
                            <p className="text-center text-xs text-slate-500 dark:text-slate-600">
                                This is a one-time setup. Make sure you've saved your master password before continuing.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupMasterPassword;