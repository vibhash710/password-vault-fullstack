import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 py-12 transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                <div className="text-center md:text-left">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Password Vault</h2>
                    <p className="text-slate-600 dark:text-slate-500 text-sm max-w-xs">
                        Protecting your digital identity with end-to-end encryption and modern security standards.
                    </p>
                </div>

                <div className="flex space-x-6 text-slate-600 dark:text-slate-400 text-sm">
                    <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Privacy Policy
                    </Link>
                    <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Terms of Service
                    </Link>
                    <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Contact
                    </Link>
                </div>

                <div className="text-slate-600 dark:text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} Password Vault. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;