import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Copy, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { calculatePasswordStrength } from '../utils/passwordStrength';

const PasswordHealthDashboard = () => {
    const [passwords, setPasswords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [decryptedPasswords, setDecryptedPasswords] = useState({});
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [masterPassword, setMasterPassword] = useState('');
    const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    const [healthScore, setHealthScore] = useState(0);
    const [weakPasswords, setWeakPasswords] = useState([]);
    const [reusedPasswords, setReusedPasswords] = useState([]);
    const [oldPasswords, setOldPasswords] = useState([]);
    const [goodPasswords, setGoodPasswords] = useState([]);

    useEffect(() => {
        fetchPasswords();
    }, []);

    const fetchPasswords = async () => {
        try {
            setLoading(true);
            const response = await api.get('/passwords');

            if (response.data.success) {
                setPasswords(response.data.passwords);
            }
        } catch (error) {
            console.error('Error fetching passwords:', error);
            toast.error('Failed to load passwords');
        } finally {
            setLoading(false);
        }
    };

    // Analyze vault health (requires decryption)
    const analyzeVaultHealth = async () => {
        if (passwords.length === 0) return;

        setShowMasterPasswordModal(true);
    };

    // Decrypt all passwords for analysis
    const decryptAllPasswords = async () => {
        if (!masterPassword) {
            toast.error('Please enter your master password');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/passwords/decrypt-all', {
                masterPassword
            });

            if (!response.data.success) {
                toast.error('Failed to decrypt passwords');
                return;
            }

            const decrypted = {};

            response.data.passwords.forEach(pwd => {
                decrypted[pwd._id] = pwd.password;
            });

            setDecryptedPasswords(decrypted);
            setShowMasterPasswordModal(false);
            setMasterPassword('');

            // Perform analysis
            performHealthAnalysis(decrypted);
            setAnalysisComplete(true);

            toast.success('Vault analysis complete!');

        } catch (error) {
            console.error('Decryption error:', error);

            setDecryptedPasswords({});
            setAnalysisComplete(false);

            if (error.response?.status === 401) {
                toast.error('Incorrect master password');
            } else {
                toast.error('Failed to decrypt passwords');
            }

            return;
        } finally {
            setLoading(false);
        }
    };

    // Perform health analysis
    const performHealthAnalysis = (decrypted) => {
        const weak = [];
        const reused = [];
        const old = [];
        const good = [];
        const passwordCounts = {};

        passwords.forEach((pwd) => {
            const plainPassword = decrypted[pwd._id];
            if (!plainPassword) return;

            // Calculate strength
            const strength = calculatePasswordStrength(plainPassword);

            const daysSinceUpdate = Math.floor(
                (Date.now() - new Date(pwd.updatedAt)) / (1000 * 60 * 60 * 24)
            );

            // Count password reuse
            if (!passwordCounts[plainPassword]) {
                passwordCounts[plainPassword] = [];
            }

            passwordCounts[plainPassword].push({
                ...pwd,
                plainPassword,
                strength
            });

            // Detect weak passwords
            if (strength.score < 60) {
                weak.push({ ...pwd, plainPassword, strength });
            }

            // Detect old passwords
            if (daysSinceUpdate > 90) {
                old.push({
                    ...pwd,
                    plainPassword,
                    daysSinceUpdate,
                    strength
                });
            }

            // Add to good if strong and not reused and recent
            if (strength.score >= 60 && daysSinceUpdate <= 90) {
                good.push({ ...pwd, plainPassword, strength });
            }
        });

        // Detect reused passwords
        Object.values(passwordCounts).forEach((pwds) => {
            if (pwds.length > 1) {
                pwds.forEach(pwd => {
                    reused.push({
                        ...pwd,
                        count: pwds.length
                    });
                });
            }
        });

        setWeakPasswords(weak);
        setReusedPasswords(reused);
        setOldPasswords(old);
        setGoodPasswords(good);

        // Calculate overall health score
        calculateHealthScore(weak.length, reused.length, old.length, passwords.length);
    };

    // Calculate overall health score
    const calculateHealthScore = (weakCount, reusedCount, oldCount, total) => {
        if (total === 0) {
            setHealthScore(0);
            return;
        }

        let score = 100;

        // Deduct points for issues
        score -= (reusedCount / total) * 40; // Reused passwords: up to -40
        score -= (weakCount / total) * 30; // Weak passwords: up to -30
        score -= (oldCount / total) * 30; // Old passwords: up to -30

        score = Math.max(0, Math.round(score));
        setHealthScore(score);
    };

    // Toggle password visibility
    const togglePasswordVisibility = (id) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Copy password
    const copyPassword = (password) => {
        navigator.clipboard.writeText(password);
        toast.success('Password copied! 📋');
    };

    // Get health score color
    const getHealthScoreColor = (score) => {
        if (score >= 80) return 'emerald';
        if (score >= 60) return 'green';
        if (score >= 40) return 'yellow';
        if (score >= 20) return 'orange';
        return 'red';
    };

    const getColorClasses = (color) => {
        const colors = {
            emerald: 'from-emerald-600 to-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20',
            green: 'from-green-600 to-green-700 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
            yellow: 'from-yellow-600 to-yellow-700 text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20',
            orange: 'from-orange-600 to-orange-700 text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20',
            red: 'from-red-600 to-red-700 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
        };
        return colors[color] || colors.red;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (passwords.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        No Passwords Yet
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Add some passwords to your vault to see your security health score.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Master Password Modal */}
            {showMasterPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                            Analyze Vault Health
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 text-center text-sm">
                            Enter your master password to decrypt and analyze all passwords
                        </p>
                        <input
                            type="password"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && decryptAllPasswords()}
                            placeholder="Master Password"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white mb-6"
                            autoFocus
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowMasterPasswordModal(false);
                                    setMasterPassword('');
                                }}
                                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={decryptAllPasswords}
                                disabled={!masterPassword}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all font-bold shadow-lg disabled:opacity-50"
                            >
                                Analyze
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                            Password Health Dashboard
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Comprehensive analysis of your vault security
                        </p>
                    </div>

                    {!analysisComplete ? (
                        /* Analyze Button */
                        <div className="max-w-2xl mx-auto">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur"></div>
                                <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
                                    <Shield className="w-20 h-20 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                        Ready to Analyze Your Vault?
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                                        We'll check for weak, reused, and old passwords to give you a comprehensive security score.
                                    </p>
                                    <button
                                        onClick={analyzeVaultHealth}
                                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all"
                                    >
                                        <TrendingUp className="w-5 h-5" />
                                        <span>Start Analysis</span>
                                    </button>
                                    <p className="text-xs text-slate-500 dark:text-slate-600 mt-4">
                                        {passwords.length} password{passwords.length !== 1 ? 's' : ''} in vault
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Overall Health Score */}
                            <div className="mb-8">
                                <div className="relative group">
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${getColorClasses(getHealthScoreColor(healthScore)).split(' ')[0]} ${getColorClasses(getHealthScoreColor(healthScore)).split(' ')[1]} rounded-xl blur opacity-30`}></div>
                                    <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                                    Vault Health Score
                                                </h2>
                                                <p className="text-slate-600 dark:text-slate-400">
                                                    Based on {passwords.length} password{passwords.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-6xl font-bold ${getColorClasses(getHealthScoreColor(healthScore)).split(' ')[2]} ${getColorClasses(getHealthScoreColor(healthScore)).split(' ')[3]}`}>
                                                    {healthScore}
                                                </div>
                                                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                    out of 100
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                                            <div
                                                className={`h-full bg-gradient-to-r ${getColorClasses(getHealthScoreColor(healthScore)).split(' ')[0]} ${getColorClasses(getHealthScoreColor(healthScore)).split(' ')[1]} transition-all duration-500`}
                                                style={{ width: `${healthScore}%` }}
                                            />
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                    {goodPasswords.length}
                                                </div>
                                                <div className="text-xs text-green-600 dark:text-green-500">
                                                    Good
                                                </div>
                                            </div>

                                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                                    {weakPasswords.length}
                                                </div>
                                                <div className="text-xs text-red-600 dark:text-red-500">
                                                    Weak
                                                </div>
                                            </div>

                                            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                                <Copy className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                                                    {reusedPasswords.length}
                                                </div>
                                                <div className="text-xs text-orange-600 dark:text-orange-500">
                                                    Reused
                                                </div>
                                            </div>

                                            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                                                    {oldPasswords.length}
                                                </div>
                                                <div className="text-xs text-yellow-600 dark:text-yellow-500">
                                                    Old (90+ days)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Issues Sections */}
                            <div className="space-y-6">
                                {/* Weak Passwords */}
                                {weakPasswords.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Weak Passwords ({weakPasswords.length})
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            These passwords are easy to crack. Consider updating them.
                                        </p>
                                        <div className="space-y-3">
                                            {weakPasswords.map((pwd) => (
                                                <div key={pwd._id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                                {pwd.site}
                                                            </div>
                                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                                {pwd.username}
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs font-bold rounded-full">
                                                            {pwd.strength.level.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <code className="flex-1 text-xs font-mono text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-950 px-3 py-2 rounded border border-red-300 dark:border-red-700">
                                                            {visiblePasswords[pwd._id] ? pwd.plainPassword : '•'.repeat(pwd.plainPassword.length)}
                                                        </code>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(pwd._id)}
                                                            className="p-2 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                        >
                                                            {visiblePasswords[pwd._id] ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => copyPassword(pwd.plainPassword)}
                                                            className="p-2 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reused Passwords */}
                                {reusedPasswords.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Copy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Reused Passwords ({reusedPasswords.length})
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            Using the same password across multiple sites is risky. If one gets compromised, all are at risk.
                                        </p>
                                        <div className="space-y-3">
                                            {reusedPasswords.map((pwd) => (
                                                <div key={pwd._id} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                                {pwd.site}
                                                            </div>
                                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                                {pwd.username}
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 text-xs font-bold rounded-full">
                                                            REUSED {pwd.count}x
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <code className="flex-1 text-xs font-mono text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-950 px-3 py-2 rounded border border-red-300 dark:border-red-700">
                                                            {visiblePasswords[pwd._id] ? pwd.plainPassword : '•'.repeat(pwd.plainPassword.length)}
                                                        </code>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(pwd._id)}
                                                            className="p-2 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                        >
                                                            {visiblePasswords[pwd._id] ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Old Passwords */}
                                {oldPasswords.length > 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Old Passwords ({oldPasswords.length})
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            These passwords haven't been changed in over 90 days. Consider updating them.
                                        </p>
                                        <div className="space-y-3">
                                            {oldPasswords.map((pwd) => (
                                                <div key={pwd._id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                                {pwd.site}
                                                            </div>
                                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                                {pwd.username}
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 bg-yellow-200 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-bold rounded-full">
                                                            {pwd.daysSinceUpdate} DAYS OLD
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* All Good! */}
                                {weakPasswords.length === 0 && reusedPasswords.length === 0 && oldPasswords.length === 0 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center">
                                        <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                            Excellent Security! 🎉
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            All your passwords are strong, unique, and up to date. Keep up the great work!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Refresh Button */}
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => {
                                        setAnalysisComplete(false);
                                        setDecryptedPasswords({});
                                        setVisiblePasswords({});
                                    }}
                                    className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors"
                                >
                                    Run Analysis Again
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default PasswordHealthDashboard;