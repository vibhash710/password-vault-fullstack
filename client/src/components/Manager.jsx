import { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import 'react-toastify/dist/ReactToastify.css';
import PasswordGenerator from './PasswordGenerator';
import usePasswordStrength from '../hooks/usePasswordStrength';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { Layers, ChevronDown, Lock, Unlock, Wand2 } from "lucide-react";

const Manager = () => {
    // Form and data state
    const [form, setForm] = useState({ site: '', username: '', password: '', category: 'other' });
    const [passwordArray, setPasswordArray] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    // UI state
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [visiblePasswordId, setVisiblePasswordId] = useState(null);
    const [lastUpdatedText, setLastUpdatedText] = useState('—');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categories = [
        { value: "social", label: "Social Media" },
        { value: "banking", label: "Banking" },
        { value: "work", label: "Work" },
        { value: "shopping", label: "Shopping" },
        { value: "education", label: "Education" },
        { value: "other", label: "Other" },
    ];
    const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
    const [isFilterCategoryOpen, setIsFilterCategoryOpen] = useState(false);
    const filterDropdownRef = useRef(null);

    // Vault session state
    const [vaultUnlocked, setVaultUnlocked] = useState(false);
    const [sessionMasterPassword, setSessionMasterPassword] = useState('');
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [unlockPasswordInput, setUnlockPasswordInput] = useState('');
    const [lastActivity, setLastActivity] = useState(Date.now());
    const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

    // Master password state (for individual actions when vault is locked)
    const [masterPassword, setMasterPassword] = useState('');
    const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Refs for focus management
    const formRef = useRef(null);
    const siteInputRef = useRef(null);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const dropdownRef = useRef(null);

    const passwordStrength = usePasswordStrength(form.password);

    // Fetch passwords on mount
    useEffect(() => {
        fetchPasswords();
    }, []);

    // Activity tracker - reset timer on user interaction
    useEffect(() => {
        const handleActivity = () => {
            setLastActivity(Date.now());
        };

        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('scroll', handleActivity);

        return () => {
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('scroll', handleActivity);
        };
    }, []);

    // Auto-lock after inactivity
    useEffect(() => {
        const checkInactivity = setInterval(() => {
            if (vaultUnlocked && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
                lockVault();
                toast.info('Vault locked due to inactivity', {
                    position: 'bottom-right',
                    theme: 'dark',
                });
            }
        }, 60000); // Check every minute

        return () => clearInterval(checkInactivity);
    }, [vaultUnlocked, lastActivity]);

    // Update "Last Updated" text every minute
    useEffect(() => {
        const interval = setInterval(() => {
            if (passwordArray.length > 0) {
                const mostRecent = passwordArray.reduce((latest, current) => {
                    return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest;
                });
                setLastUpdatedText(getLastUpdatedText(mostRecent.updatedAt));
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [passwordArray]);

    // Auto-focus when showing/editing form
    useEffect(() => {
        if (!showForm) return;

        if (formMode === 'add') {
            siteInputRef.current?.focus();
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        if (formMode === 'edit') {
            passwordRef.current?.focus();
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [showForm, formMode]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsCategoryOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target)
            ) {
                setIsFilterCategoryOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Unlock vault function
    const unlockVault = async () => {
        if (!unlockPasswordInput) {
            toast.error('Please enter your master password');
            return;
        }

        try {
            const response = await api.post('/passwords/verify-master', {
                masterPassword: unlockPasswordInput
            });

            if (response.data.success) {
                // Password is correct
                setSessionMasterPassword(unlockPasswordInput);
                setVaultUnlocked(true);
                setShowUnlockModal(false);
                setUnlockPasswordInput('');
                setLastActivity(Date.now());
                toast.success('Vault unlocked! 🔓', {
                    position: 'bottom-right',
                    theme: 'dark',
                });
            }
        } catch (error) {
            console.error('Unlock vault error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message =
                error.response?.data?.message ||
                'Incorrect master password';
            toast.error(message);
            setUnlockPasswordInput('');
        }
    };

    // Lock vault function
    const lockVault = () => {
        setVaultUnlocked(false);
        setSessionMasterPassword('');
        setVisiblePasswordId(null); // Hide all visible passwords
        toast.info('Vault locked 🔒', {
            position: 'bottom-right',
            theme: 'dark',
        });
    };

    // Calculate last updated text
    const getLastUpdatedText = (timestamp) => {
        if (!timestamp) return '—';

        const now = new Date();
        const updated = new Date(timestamp);

        const diffMs = now - updated;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 30) return 'Just now';
        if (diffMinutes < 1) return `${diffSeconds} seconds ago`;
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return updated.toLocaleDateString();
    };

    // Fetch all passwords from backend
    const fetchPasswords = async () => {
        try {
            setLoading(true);
            const response = await api.get('/passwords');

            if (response.data.success) {
                setPasswordArray(response.data.passwords);

                if (response.data.passwords.length > 0) {
                    const mostRecent = response.data.passwords.reduce((latest, current) => {
                        return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest;
                    });
                    setLastUpdatedText(getLastUpdatedText(mostRecent.updatedAt));
                }
            }
        } catch (error) {
            console.error('Error fetching passwords:', error);
            if (error.response?.status === 429) {
                return;
            }
            if (error.response?.status === 401) {
                toast.error('Please login to view your passwords');
                window.location.href = '/signin';
            } else {
                toast.error('Failed to load passwords');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle Enter key navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const currentField = e.target.name;

            if (currentField === 'site') {
                usernameRef.current?.focus();
            }
            else if (currentField === 'username') {
                passwordRef.current?.focus();
            }
            else if (currentField === 'password' || currentField === 'category') {
                savePassword();
            }
        }
    };

    const startVaultSession = (masterPass) => {
        setSessionMasterPassword(masterPass);
        setVaultUnlocked(true);
        setLastActivity(Date.now());
        passwordRef.current?.focus();
    };

    // Add handler to insert generated password
    const handlePasswordGenerated = (password) => {
        setForm({ ...form, password });
        setShowPasswordGenerator(false);
        passwordRef.current?.focus();
    };

    // Save password (use session password if unlocked)
    const savePassword = () => {
        if (form.site.length < 4 || form.username.length < 4 || form.password.length < 4) {
            toast.error('All fields required (min 4 characters)', {
                position: 'bottom-right',
                autoClose: 2500,
                theme: 'dark',
            });
            return;
        }

        // If vault is unlocked, use session password
        if (vaultUnlocked && sessionMasterPassword) {
            executeSaveWithPassword(sessionMasterPassword);
        } else {
            // Vault is locked, ask for master password
            setPendingAction({
                type: editingId ? 'update' : 'create',
                data: form
            });
            setShowMasterPasswordModal(true);
        }
    };

    // Execute save with provided password
    const executeSaveWithPassword = async (masterPass) => {
        try {
            if (editingId) {
                // Update existing password
                const response = await api.put(`/passwords/${editingId}`, {
                    site: form.site,
                    username: form.username,
                    password: form.password,
                    masterPassword: masterPass,
                    category: form.category
                });

                if (response.data.success) {
                    toast.success('Credential updated!', {
                        position: 'bottom-right',
                        autoClose: 2000,
                        theme: 'dark',
                    });
                    setForm({ site: '', username: '', password: '', category: 'other' });
                    setEditingId(null);
                    setFormMode('add');
                    setShowForm(false);
                    fetchPasswords();
                }
            } else {
                // Create new password
                const response = await api.post('/passwords', {
                    site: form.site,
                    username: form.username,
                    password: form.password,
                    masterPassword: masterPass,
                    category: form.category
                });

                if (response.data.success) {
                    toast.success('Credential saved!', {
                        position: 'bottom-right',
                        autoClose: 2000,
                        theme: 'dark',
                    });
                    setForm({ site: '', username: '', password: '', category: 'other' });
                    setShowForm(false);
                    fetchPasswords();
                }
            }
        } catch (error) {
            console.error('Save password error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to save password';
            toast.error(message);

            // If master password is wrong, lock vault
            if (error.response?.status === 401) {
                lockVault();
            }
        }
    };

    // Execute save after master password is provided (when vault is locked)
    const executeSave = async () => {
        if (!masterPassword) {
            toast.error('Master password is required');
            return;
        }

        await executeSaveWithPassword(masterPassword);

        startVaultSession(masterPassword);

        setMasterPassword('');
        setShowMasterPasswordModal(false);
        setPendingAction(null);
    };

    // Delete password
    const deletePassword = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // Execute delete with provided password
    const executeDeleteWithPassword = async (id, masterPass) => {
        try {
            const response = await api.delete(`/passwords/${id}`, {
                data: { masterPassword: masterPass }
            });

            if (response.data.success) {
                toast.info('Credential removed', {
                    position: 'bottom-right',
                    autoClose: 1500,
                    theme: 'dark',
                });
                fetchPasswords();
            }
        } catch (error) {
            console.error('Delete password error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to delete password';
            toast.error(message);

            if (error.response?.status === 401) {
                lockVault();
            }
        }
    };

    // Execute delete after master password is provided
    const executeDelete = async () => {
        if (!masterPassword) {
            toast.error('Master password is required');
            return;
        }

        await executeDeleteWithPassword(pendingAction.id, masterPassword);

        startVaultSession(masterPassword);

        setMasterPassword('');
        setShowMasterPasswordModal(false);
        setPendingAction(null);
    };

    // Edit password
    const editPassword = (id) => {
        const password = passwordArray.find(p => p._id === id);

        if (vaultUnlocked && sessionMasterPassword) {
            executeEditWithPassword(password, sessionMasterPassword);
        } else {
            setPendingAction({ type: 'edit', password });
            setShowMasterPasswordModal(true);
        }
    };

    // Execute edit with provided password
    const executeEditWithPassword = async (password, masterPass) => {
        try {
            const response = await api.post(`/passwords/${password._id}/decrypt`, {
                masterPassword: masterPass
            });

            if (response.data.success) {
                const decrypted = response.data.password;
                setForm({
                    site: decrypted.site,
                    username: decrypted.username,
                    password: decrypted.password,
                    category: password.category
                });
                setEditingId(password._id);
                setFormMode('edit');
                setShowForm(true);
            }
        } catch (error) {
            console.error('Decrypt error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to decrypt password';
            toast.error(message);

            if (error.response?.status === 401) {
                lockVault();
            }
        }
    };

    // Execute edit after master password is provided
    const executeEdit = async () => {
        if (!masterPassword) {
            toast.error('Master password is required');
            return;
        }

        await executeEditWithPassword(pendingAction.password, masterPassword);

        startVaultSession(masterPassword);

        setMasterPassword('');
        setShowMasterPasswordModal(false);
        setPendingAction(null);
    };

    // View password
    const viewPassword = async (id) => {
        if (visiblePasswordId === id) {
            setVisiblePasswordId(null);
            return;
        }

        if (vaultUnlocked && sessionMasterPassword) {
            executeViewWithPassword(id, sessionMasterPassword);
        } else {
            setPendingAction({ type: 'view', id });
            setShowMasterPasswordModal(true);
        }
    };

    // Execute view with provided password
    const executeViewWithPassword = async (id, masterPass) => {
        try {
            const response = await api.post(`/passwords/${id}/decrypt`, {
                masterPassword: masterPass
            });

            if (response.data.success) {
                const decrypted = response.data.password;

                setPasswordArray(prev => prev.map(p =>
                    p._id === id
                        ? { ...p, decryptedPassword: decrypted.password }
                        : p
                ));

                setVisiblePasswordId(id);
            }
        } catch (error) {
            console.error('Decrypt error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to decrypt password';
            toast.error(message);

            if (error.response?.status === 401) {
                lockVault();
            }
        }
    };

    // Execute view after master password is provided
    const executeView = async () => {
        if (!masterPassword) {
            toast.error('Master password is required');
            return;
        }

        await executeViewWithPassword(pendingAction.id, masterPassword);

        startVaultSession(masterPassword);

        setMasterPassword('');
        setShowMasterPasswordModal(false);
        setPendingAction(null);
    };

    // Copy to clipboard
    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        toast('Copied successfully!', {
            position: 'bottom-right',
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: 'dark',
            style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
            }
        });
    };

    // Toggle password visibility in form
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    // Handle master password modal actions
    const handleMasterPasswordSubmit = () => {
        if (pendingAction?.type === 'create' || pendingAction?.type === 'update') {
            executeSave();
        } else if (pendingAction?.type === 'delete') {
            executeDelete();
        } else if (pendingAction?.type === 'edit') {
            executeEdit();
        } else if (pendingAction?.type === 'view') {
            executeView();
        }
    };

    const cancelMasterPassword = () => {
        setMasterPassword('');
        setShowMasterPasswordModal(false);
        setPendingAction(null);
    };

    // Filter passwords
    const filteredPasswords = passwordArray.filter(item => {
        const matchesSearch = searchTerm === '' ||
            item.site?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.username?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' ||
            item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            {/* Unlock Vault Modal */}
            {showUnlockModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                            Unlock Your Vault
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
                            Enter your master password to unlock the vault
                        </p>
                        <input
                            type="password"
                            value={unlockPasswordInput}
                            onChange={(e) => setUnlockPasswordInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
                            placeholder="Master Password"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white mb-6"
                            autoFocus
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowUnlockModal(false);
                                    setUnlockPasswordInput('');
                                }}
                                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={unlockVault}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all font-medium shadow-lg"
                            >
                                Confirm
                            </button>
                        </div>
                        <p className="text-xs text-center text-slate-500 dark:text-slate-600 mt-4">
                            Vault will auto-lock after 15 minutes of inactivity
                        </p>
                    </div>
                </div>
            )}

            {/* Master Password Modal (for locked vault) */}
            {showMasterPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Enter Master Password
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {pendingAction?.type === 'view' && 'Enter your master password to view this password'}
                            {pendingAction?.type === 'edit' && 'Enter your master password to edit this password'}
                            {pendingAction?.type === 'delete' && 'Enter your master password to delete this password'}
                            {(pendingAction?.type === 'create' || pendingAction?.type === 'update') && 'Enter your master password to save this password'}
                        </p>
                        <input
                            type="password"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleMasterPasswordSubmit()}
                            placeholder="Master Password"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white mb-6"
                            autoFocus
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelMasterPassword}
                                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMasterPasswordSubmit}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all font-medium shadow-lg"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            Delete Credential
                        </h3>

                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Are you sure you want to remove this credential?
                            This action cannot be undone.
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteId(null);
                                }}
                                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);

                                    if (vaultUnlocked && sessionMasterPassword) {
                                        executeDeleteWithPassword(deleteId, sessionMasterPassword);
                                    } else {
                                        setPendingAction({ type: 'delete', id: deleteId });
                                        setShowMasterPasswordModal(true);
                                    }

                                    setDeleteId(null);
                                }}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all font-medium shadow-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refined Blob Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-10 dark:opacity-15 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-10 dark:opacity-15 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-10 dark:opacity-15 animate-blob animation-delay-4000"></div>
            </div>

            <div className="min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Hero Section */}
                    <div className="text-center mb-12 pt-4">
                        <div className="inline-block mb-6">
                            <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full border border-slate-200 dark:border-white/10 shadow-md">
                                <div className="w-2.5 h-2.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-[pulse_2s_infinite]"></div>
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                    {vaultUnlocked ? 'Vault Unlocked' : 'Vault Locked'}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Password Vault
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                            Your secure digital fortress. Store, manage, and access your passwords with military-grade protection.
                        </p>

                        {/* Lock/Unlock Button */}
                        <button
                            onClick={() => vaultUnlocked ? lockVault() : setShowUnlockModal(true)}
                            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${vaultUnlocked
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                                }`}
                        >
                            {vaultUnlocked ? (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>Lock Vault</span>
                                </>
                            ) : (
                                <>
                                    <Unlock className="w-5 h-5" />
                                    <span>Unlock Vault</span>
                                </>
                            )}
                        </button>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-indigo-400 dark:hover:border-indigo-700/50 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1 flex justify-items-start">Total Credentials</p>
                                            <p className="text-4xl font-bold text-slate-900 dark:text-white flex justify-items-start">{passwordArray.length}</p>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/30">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-emerald-400 dark:hover:border-emerald-700/50 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-1 flex justify-items-start">24/7</p>
                                            <p className="text-3xl font-bold text-slate-900 dark:text-white flex justify-items-start">Protected</p>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30 dark:shadow-emerald-900/30">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-purple-400 dark:hover:border-purple-700/50 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-1 flex justify-items-start">Last Updated</p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white flex justify-items-start">{lastUpdatedText}</p>
                                        </div>
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30 dark:shadow-purple-900/30">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Credential Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => {
                                setFormMode('add');
                                if (!showForm) {
                                    setShowForm(true);
                                } else {
                                    // If form already open → scroll to it
                                    formRef.current?.scrollIntoView({ behavior: "smooth" });
                                    siteInputRef.current?.focus();
                                }
                                setForm({ site: '', username: '', password: '', category: 'other' });
                                setEditingId(null);
                            }}
                            className="w-full relative group"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-indigo-400 dark:hover:border-indigo-700/60 transition-all duration-300">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40 dark:shadow-indigo-900/40 flex-shrink-0">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Password</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-500">Securely store a new credential</p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Add/Edit Password Form */}
                    {showForm && (
                        <div ref={formRef} className="mb-8 animate-slideDown">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
                                <div className="relative bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {formMode === 'edit' ? 'Edit Credential' : 'Add New Credential'}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setShowForm(false);
                                                setForm({ site: '', username: '', password: '', category: 'other' });
                                                setEditingId(null);
                                                setFormMode('add');
                                            }}
                                            className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Website URL */}
                                        <div className="relative group">
                                            <label className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wide">Website URL</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-500 dark:text-slate-600 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                    </svg>
                                                </div>
                                                <input
                                                    ref={siteInputRef}
                                                    value={form.site}
                                                    onChange={handleChange}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="https://example.com"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                                                    type="text"
                                                    name="site"
                                                />
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <div className="relative group">
                                            <label className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wide">Username / Email</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-500 dark:text-slate-600 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    ref={usernameRef}
                                                    value={form.username}
                                                    onChange={handleChange}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="your.email@example.com"
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                                                    type="text"
                                                    name="username"
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="relative group">
                                            <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wide">Password</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-slate-500 dark:text-slate-600 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    ref={passwordRef}
                                                    type={isPasswordVisible ? 'text' : 'password'}
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Enter your password"
                                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                                                    name="password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
                                                >
                                                    <img
                                                        src={isPasswordVisible ? '/icons/view-off-slash-stroke-rounded.png' : '/icons/view-stroke-rounded.png'}
                                                        alt="toggle"
                                                        className="invert dark:invert-0 w-4 h-4 opacity-70 hover:opacity-100"
                                                    />
                                                </button>
                                                {/* Generate button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowPasswordGenerator(prev => !prev);
                                                    }}
                                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                                    title="Generate password"
                                                >
                                                    <Wand2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {/*PASSWORD STRENGTH INDICATOR */}
                                            {form.password && (
                                                <div className="mt-3">
                                                    <PasswordStrengthIndicator
                                                        password={form.password}
                                                        strength={passwordStrength}
                                                        showDetails={true}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {/* Password Generator Panel */}
                                        {showPasswordGenerator && (
                                            <div className="mt-4 p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
                                                <PasswordGenerator
                                                    onSelectPassword={handlePasswordGenerated}
                                                    onClose={() => setShowPasswordGenerator(false)}
                                                    currentSite={form.site}
                                                />
                                            </div>
                                        )}

                                        {/* Category Dropdown */}
                                        <div>
                                            <label className="block text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wide">
                                                Category
                                            </label>

                                            <div className="relative" ref={dropdownRef}>
                                                {/* Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                                    className="w-full relative pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-lg text-left text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                                                >
                                                    {/* Left Icon - ABSOLUTE */}
                                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                                    {/* Selected Text */}
                                                    {
                                                        categories.find(c => c.value === form.category)?.label
                                                    }

                                                    {/* Right Arrow */}
                                                    <ChevronDown
                                                        className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {isCategoryOpen && (
                                                    <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                                        {categories.map((category) => (
                                                            <div
                                                                key={category.value}
                                                                onClick={() => {
                                                                    setForm(prev => ({
                                                                        ...prev,
                                                                        category: category.value
                                                                    }));
                                                                    setIsCategoryOpen(false);
                                                                }}
                                                                className="px-4 py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition"
                                                            >
                                                                {category.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end space-x-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setForm({ site: '', username: '', password: '', category: 'other' });
                                                    setEditingId(null);
                                                    setFormMode('add');
                                                }}
                                                className="px-6 py-3 bg-slate-200 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={savePassword}
                                                className="flex items-center space-x-2 px-5 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/40 dark:shadow-indigo-900/40 transform hover:scale-105 transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <span>{formMode === 'edit' ? 'Update Credential' : 'Save to Vault'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter */}
                    {passwordArray.length > 0 && (
                        <div className="flex flex-col md:flex-row gap-4 mb-8">

                            {/* Search Input */}
                            <div className="relative flex-1">
                                <svg
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-4.35-4.35M16.65 10.65A6 6 0 1110.65 4.65a6 6 0 016 6z"
                                    />
                                </svg>

                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search passwords..."
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600"
                                />
                            </div>

                            {/* Custom Category Dropdown */}
                            <div className="relative w-56" ref={filterDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterCategoryOpen(!isFilterCategoryOpen)}
                                    className="w-full relative pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-300 dark:border-slate-800 rounded-lg text-left text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
                                >
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    {selectedCategory === "all"
                                        ? "All Categories"
                                        : categories.find(c => c.value === selectedCategory)?.label}

                                    <ChevronDown
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform duration-200 ${isFilterCategoryOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {isFilterCategoryOpen && (
                                    <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                                        <div
                                            onClick={() => {
                                                setSelectedCategory("all");
                                                setIsFilterCategoryOpen(false);
                                            }}
                                            className="px-4 py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition"
                                        >
                                            All Categories
                                        </div>

                                        {categories.map((category) => (
                                            <div
                                                key={category.value}
                                                onClick={() => {
                                                    setSelectedCategory(category.value);
                                                    setIsFilterCategoryOpen(false);
                                                }}
                                                className="px-4 py-3 cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-indigo-100 dark:hover:bg-indigo-600/20 transition"
                                            >
                                                {category.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {/* Your Vault Section */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Vault</h2>
                            {passwordArray.length > 0 && (
                                <span className="text-sm text-slate-600 dark:text-slate-500">
                                    {filteredPasswords.length} of {passwordArray.length} item{passwordArray.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                                <p className="text-slate-600 dark:text-slate-400 mt-4">Loading passwords...</p>
                            </div>
                        ) : passwordArray.length === 0 ? (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl blur opacity-50"></div>
                                <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-16 text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-6">
                                        <svg className="w-10 h-10 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your vault is empty</h3>
                                    <p className="text-slate-600 dark:text-slate-500 mb-8 max-w-md mx-auto">Start protecting your digital life by adding your first credential</p>
                                    <button
                                        onClick={() => {
                                            setFormMode('add');
                                            setShowForm(true);
                                            setTimeout(() => {
                                                formRef.current?.scrollIntoView({ behavior: "smooth" });
                                                siteInputRef.current?.focus();
                                            }, 50);
                                        }}
                                        className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/40 dark:shadow-indigo-900/40 transform hover:scale-105 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Add First Credential</span>
                                    </button>
                                </div>
                            </div>
                        ) : filteredPasswords.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-600 dark:text-slate-400 text-lg">
                                    No passwords match your search
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredPasswords.map((item) => (
                                    <div key={item._id} className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                        <div className="relative bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-indigo-400 dark:hover:border-indigo-700/50 transition-all duration-300">

                                            {/* Header with Icon and Category */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${item.site}&sz=64`}
                                                        alt="favicon"
                                                        className="w-10 h-10 rounded-lg object-contain"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><text x="50%" y="50%" font-size="20" text-anchor="middle" dy=".3em" fill="%23667eea">' + item.site?.charAt(0).toUpperCase() + '</text></svg>';
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <a
                                                                href={item.site?.startsWith('http') ? item.site : `https://${item.site}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                                                            >
                                                                {item.site?.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}
                                                            </a>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-600 truncate">{item.site}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => editPassword(item._id)}
                                                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => deletePassword(item._id)}
                                                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-800 to-transparent mb-4"></div>

                                            {/* Username Field */}
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Username</label>
                                                    <button
                                                        onClick={() => copyText(item.username)}
                                                        className="text-xs text-slate-500 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center space-x-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Copy</span>
                                                    </button>
                                                </div>
                                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg">
                                                    <p className="text-sm text-slate-900 dark:text-white font-mono truncate">{item.username}</p>
                                                </div>
                                            </div>

                                            {/* Password Field */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Password</label>
                                                    <div className="flex items-center space-x-2">
                                                        {visiblePasswordId === item._id && item.decryptedPassword && (
                                                            <button
                                                                onClick={() => copyText(item.decryptedPassword)}
                                                                className="text-xs text-slate-500 dark:text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center space-x-1"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>Copy</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
                                                    <p className="text-sm text-slate-900 dark:text-white font-mono break-all pr-3">
                                                        {visiblePasswordId === item._id && item.decryptedPassword
                                                            ? item.decryptedPassword
                                                            : '●'.repeat(12)}
                                                    </p>
                                                    <button
                                                        onClick={() => viewPassword(item._id)}
                                                        className="text-xs text-slate-500 dark:text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-shrink-0"
                                                    >
                                                        <img
                                                            src={visiblePasswordId === item._id ? '/icons/view-off-slash-stroke-rounded.png' : '/icons/view-stroke-rounded.png'}
                                                            alt="toggle"
                                                            className="invert dark:invert-0 w-4 h-4 opacity-70 hover:opacity-100 transition"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div >

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
};

export default Manager;