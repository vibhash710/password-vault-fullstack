import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <div className="flex items-center space-x-2 bg-white/80 dark:bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-white/10">
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">Legal</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400">
                        Last updated: March 7, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-12 shadow-sm">

                    {/* Introduction */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Introduction
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Password Vault is built with privacy and security as core principles.
                            This Privacy Policy explains how we collect, use, store, and protect
                            your information when you use our password management service.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Information We Collect
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-3">
                            Depending on how you use Password Vault, we may collect the following information:
                        </p>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>
                                <strong>Account Information:</strong> Name, email address, and authentication method.
                            </li>

                            <li>
                                <strong>Stored Credentials:</strong> Website URLs and usernames stored in your vault. Passwords are stored only in encrypted form.
                            </li>

                            <li>
                                <strong>Master Password:</strong> Your master password is securely hashed and never stored in plain text.
                            </li>

                            <li>
                                <strong>Usage Data:</strong> Basic login activity and feature usage information to improve the service.
                            </li>

                            <li>
                                <strong>Technical Data:</strong> Device, browser, and IP information used for security monitoring and service operation.
                            </li>
                        </ul>
                    </section>

                    {/* Encryption */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Encryption and Security
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-3">
                            Protecting your vault is our highest priority. Password Vault uses modern,
                            industry-standard encryption and security practices designed
                            to safeguard your sensitive information.
                        </p>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>All passwords are encrypted before being stored.</li>
                            <li>Your master password is securely hashed and cannot be reversed.</li>
                            <li>Encryption keys are derived from your master password.</li>
                            <li>We cannot access or recover your master password.</li>
                            <li>If the master password is forgotten, the vault must be reset for security reasons.</li>
                        </ul>
                    </section>

                    {/* How We Use Data */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            How We Use Your Information
                        </h2>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>Provide and maintain the Password Vault password management service</li>
                            <li>Securely store and manage your credentials</li>
                            <li>Authenticate your identity</li>
                            <li>Send essential service emails such as verification or password reset messages</li>
                            <li>Improve performance, reliability, and security</li>
                            <li>Detect and prevent fraudulent or malicious activity</li>
                        </ul>
                    </section>

                    {/* Security Measures */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Data Storage and Security Measures
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-3">
                            Password Vault uses multiple layers of protection to safeguard your data.
                        </p>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>Encrypted storage for sensitive credentials</li>
                            <li>Secure authentication mechanisms</li>
                            <li>Session protection and automatic inactivity locking</li>
                            <li>Rate limiting and abuse prevention systems</li>
                            <li>Encrypted communication over HTTPS</li>
                            <li>Strict access control on all API endpoints</li>
                        </ul>
                    </section>

                    {/* Third Party */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Third-Party Services
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-3">
                            Password Vault integrates with trusted third-party services required for certain features.
                        </p>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>OAuth providers (Google and GitHub) for optional authentication</li>
                            <li>Email delivery services used to send verification and security notifications</li>
                            <li>AI services used for optional password generation features</li>
                            <li>External services used to display website icons</li>
                        </ul>
                    </section>

                    {/* Data Sharing */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Data Sharing
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            We do not sell, rent, or trade your personal information.
                            Your encrypted vault data is never shared with third parties.
                            Information may only be shared with trusted infrastructure
                            providers when necessary to operate the service or comply
                            with legal obligations.
                        </p>
                    </section>

                    {/* User Rights */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Your Rights and Control
                        </h2>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>Add and store credentials in their vault</li>
                            <li>Access your stored credentials</li>
                            <li>Update or modify stored credentials</li>
                            <li>Delete individual credentials</li>
                            <li>Reset your entire vault</li>
                            <li>Request permanent deletion of their account and associated data</li>
                        </ul>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Data Retention
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            We retain your account information and encrypted vault data
                            only while your account remains active. If you delete your
                            account or reset your vault, associated data is permanently
                            removed from our systems and cannot be recovered.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Cookies and Sessions
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Password Vault uses secure cookies and session mechanisms for authentication
                            and account security. These cookies are essential for the service
                            to function and help maintain a secure login experience.
                        </p>
                    </section>

                    {/* Updates */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Changes to This Policy
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            This Privacy Policy may be updated periodically to reflect
                            improvements in the service, legal requirements, or security
                            practices. The "Last updated" date indicates the most recent revision.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Contact Us
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            If you have questions or concerns about this Privacy Policy,
                            please contact us through our{' '}
                            <a
                                href="/contact"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                                Contact page
                            </a>.
                        </p>
                    </section>

                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Vault</span>
                    </a>
                </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;