import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Sun, Moon, ChevronDown, ShieldCheck, LogOut, ShieldX } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/signin');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <>
            <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-200">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold">V</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                Vault
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button
                                onClick={toggleTheme}
                                className="text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? (<Sun className="w-5 h-5 text-yellow-500" />) : (<Moon className="w-5 h-5 text-slate-700" />)}
                            </button>

                            {user ? (
                                <>
                                    <Link
                                        to="/health-dashboard"
                                        className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>Health</span>
                                    </Link>

                                    <div ref={profileRef} className="relative">
                                        <button
                                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >

                                            {user?.profilePicture ? (
                                                <img
                                                    src={user.profilePicture || "/default-avatar.svg"}
                                                    referrerPolicy="no-referrer"
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full text-slate-300 dark:text-slate-600"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = "/default-avatar.svg";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                                    {user?.name?.charAt(0)}
                                                </div>
                                            )}

                                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                {user?.name}
                                            </span>

                                            <ChevronDown className="w-4 h-4 text-slate-500" />

                                        </button>

                                        {/* Dropdown Menu */}
                                        {showProfileMenu && (
                                            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <LogOut className="w-4 h-4" />
                                                        <span>Logout</span>
                                                    </div>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate('/reset-vault');
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <ShieldX className="w-4 h-4" />
                                                        <span>Reset Vault</span>
                                                    </div>
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </>
                            ) : (
                                <Link
                                    to="/signin"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/20"
                                >
                                    Log in
                                </Link>
                            )}
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden flex items-center space-x-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 transition-colors"
                                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDark ? (
                                    <Sun className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <Moon className="w-5 h-5 text-slate-700" />
                                )}
                            </button>
                            {/* Hamburger */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-4 py-4 space-y-2 transition-colors duration-200">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-3 px-2 py-2">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture || "/default-avatar.svg"}
                                            referrerPolicy="no-referrer"
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full text-slate-300 dark:text-slate-600"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = "/default-avatar.svg";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        {user?.name}
                                    </span>
                                </div>

                                <Link
                                    to="/health-dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Health</span>
                                </Link>

                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </div>
                                </button>

                                {/* Divider */}
                                <div className="border-t border-slate-200 dark:border-white/10 my-2"></div>

                                <button
                                    onClick={() => {
                                        navigate('/reset-vault');
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        <ShieldX className="w-4 h-4" />
                                        <span>Reset Vault</span>
                                    </div>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/signin"
                                    className="block text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
                                >
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;