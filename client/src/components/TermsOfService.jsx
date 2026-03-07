import React from 'react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <div className="flex items-center space-x-2 bg-white/80 dark:bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-white/10">
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                Legal
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Terms of Service
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400">
                        Last updated: March 7, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-8 md:p-12 shadow-sm">

                    {/* Agreement */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Agreement to Terms
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            By accessing or using Password Vault, you agree to be bound by these
                            Terms of Service. If you do not agree to these terms, you
                            must not use the service. These terms apply to all users
                            who access or use the platform.
                        </p>
                    </section>

                    {/* Service Description */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Service Description
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Password Vault is a password management service designed to help
                            users securely store, organize, and manage their login
                            credentials. The service includes encrypted credential
                            storage, password generation tools, security analysis,
                            and authentication features.
                        </p>
                    </section>

                    {/* Account Security */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Account Security and Master Password
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-3">
                            You are responsible for maintaining the security of your account.
                        </p>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>
                                <strong>Master Password:</strong> You must create a strong master password to secure your vault. This password cannot be recovered if forgotten.
                            </li>

                            <li>
                                <strong>Data Loss:</strong> Forgetting your master password will result in permanent loss of access to encrypted vault data.
                            </li>

                            <li>
                                <strong>Session Security:</strong> Your vault may automatically lock after a period of inactivity or when manually locked.
                            </li>

                            <li>
                                <strong>Unauthorized Access:</strong> You must notify us immediately if you suspect unauthorized access to your account.
                            </li>

                            <li>
                                <strong>Password Strength:</strong> Users are responsible for choosing strong and unique passwords for their accounts.
                            </li>
                        </ul>
                    </section>

                    {/* User Responsibilities */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Your Responsibilities
                        </h2>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>Use the service only for lawful purposes</li>
                            <li>Maintain the confidentiality of your account credentials</li>
                            <li>Provide accurate information during registration</li>
                            <li>Verify your email address when required</li>
                            <li>Not attempt to reverse engineer or modify the application</li>
                            <li>Not store or transmit illegal or harmful content</li>
                            <li>Not use automated tools to abuse the service</li>
                            <li>Not share your account credentials with others</li>
                        </ul>
                    </section>

                    {/* Service Availability */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Service Availability
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            We strive to maintain reliable service availability,
                            but we do not guarantee uninterrupted access.
                            The service may occasionally be unavailable due
                            to maintenance, updates, or technical issues.
                        </p>
                    </section>

                    {/* Data Backup */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Data Backup and Export
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            While we implement backup systems to protect service
                            reliability, users are encouraged to maintain their
                            own backups of important credentials. We are not
                            responsible for data loss caused by forgotten master
                            passwords, account deletion, or service disruptions.
                        </p>
                    </section>

                    {/* Prohibited Uses */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Prohibited Uses
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-3">
                            You may not use Vault to:
                        </p>

                        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
                            <li>Conduct illegal activities</li>
                            <li>Attempt unauthorized access to systems</li>
                            <li>Circumvent security protections</li>
                            <li>Distribute malware or malicious content</li>
                            <li>Violate the privacy or rights of others</li>
                        </ul>
                    </section>

                    {/* Security Responsibility */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Security Responsibility
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            While Password Vault implements strong security measures,
                            users remain responsible for protecting their login
                            credentials and master password. We cannot recover
                            encrypted vault data if the master password is forgotten.
                        </p>
                    </section>

                    {/* Disclaimer */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Disclaimer of Warranties
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Vault is provided on an "as is" and "as available"
                            basis without warranties of any kind. We do not
                            guarantee that the service will always be secure,
                            uninterrupted, or error-free.
                        </p>
                    </section>

                    {/* Liability */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Limitation of Liability
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            To the maximum extent permitted by law, Password Vault and its
                            developers shall not be liable for any indirect,
                            incidental, or consequential damages including loss
                            of data, loss of vault access, service interruptions,
                            or security incidents arising from the use of the service.
                        </p>
                    </section>

                    {/* Intellectual Property */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Intellectual Property
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            All software, design, branding, and intellectual
                            property related to Password Vault remain the property of
                            the developers. You may not copy, modify, distribute,
                            or reproduce any part of the service without permission.
                        </p>
                    </section>

                    {/* Termination */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Termination
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            We reserve the right to suspend or terminate access
                            to the service if users violate these Terms or abuse
                            the platform. Users may stop using the service at
                            any time. Upon termination, vault data may be
                            permanently removed.
                        </p>
                    </section>

                    {/* Fair Use */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Fair Use
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            To protect system stability and security, we may
                            implement safeguards such as rate limiting and
                            abuse prevention systems. Excessive or abusive
                            usage may result in temporary restrictions.
                        </p>
                    </section>

                    {/* Changes */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Changes to Terms
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            These Terms may be updated periodically to reflect
                            improvements in the service or legal requirements.
                            Continued use of the service after updates
                            constitutes acceptance of the revised Terms.
                        </p>
                    </section>

                    {/* Law */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Governing Law
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            These Terms shall be governed by and interpreted
                            in accordance with the laws of India. Any disputes
                            arising from the use of the service will fall under
                            the jurisdiction of the courts of India.
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Contact Information
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            If you have any questions regarding these Terms,
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

export default TermsOfService;