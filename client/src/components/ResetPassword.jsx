import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ResetPassword = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Verify OTP, 2: Set New Password
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    // Refs for OTP inputs
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    useEffect(() => {
        if (!email) {
            toast.error('Invalid access. Please request password reset first.');
            navigate('/forgot-password');
            return;
        }

        inputRefs[0].current?.focus();
    }, []);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const text = e.clipboardData.getData('text');

        const digits = text.replace(/\D/g, '').slice(0, 6).split('');

        const newOtp = ['', '', '', '', '', ''];

        digits.forEach((digit, i) => {
            newOtp[i] = digit;
        });

        setOtp(newOtp);

        const lastIndex = Math.min(digits.length, 5);
        inputRefs[lastIndex]?.current?.focus();
    };

    const verifyOtp = async (e) => {
        e.preventDefault();

        const otpString = otp.join('');

        if (otpString.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/verify-reset-otp', {
                email,
                otp: otpString
            });

            if (response.data.success) {
                toast.success('Code verified! Set your new password.');
                setStep(2);
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Invalid or expired code';
            toast.error(message);
            setOtp(['', '', '', '', '', '']);
            inputRefs[0].current?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/reset-password', {
                email,
                otp: otp.join(''),
                newPassword
            });

            if (response.data.success) {
                toast.success('Password reset successful!');
                setTimeout(() => {
                    navigate('/signin', { replace: true });
                }, 1500);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to reset password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setResending(true);

        try {
            const response = await api.post('/auth/resend-reset-otp', { email });

            if (response.data.success) {
                toast.success('New code sent to your email!');
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
                inputRefs[0].current?.focus();
            }
        } catch (error) {
            console.error('Resend error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to resend code';
            toast.error(message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
                        {step === 1 ? 'Enter Reset Code' : 'Set New Password'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {step === 1 ? `We sent a code to ${email}` : 'Choose a strong password'}
                    </p>
                </div>

                {/* Step 1: Verify OTP */}
                {step === 1 && (
                    <div className="relative group mb-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
                        <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <form onSubmit={verifyOtp}>
                                <div className="flex justify-center space-x-3 mb-6">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={inputRefs[index]}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white transition-all"
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.join('').length !== 6}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    Didn't receive the code?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={countdown > 0 || resending}
                                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Set New Password */}
                {step === 2 && (
                    <div className="relative group mb-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
                        <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password (min 6 characters)"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white"
                                        required
                                        minLength={6}
                                        autoFocus
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
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
                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded"
                                    />
                                    <label htmlFor="showPassword" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                                        Show password
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/signin')}
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;