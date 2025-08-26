// File: resources/js/Pages/Auth/VerifyEmail.jsx

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Mail,
    Send,
    CheckCircle,
    ShoppingBag,
    ArrowRight
} from 'lucide-react';

export default function VerifyEmail({ status, user }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Verify Email" />

            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">WarAccounts</span>
                    </Link>
                    <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                        Verify your email
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        We've sent a verification link to
                    </p>
                    <p className="text-blue-400 font-medium">{user.email}</p>
                </div>

                {/* Status Message */}
                {status === 'verification-link-sent' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-800">
                                    A new verification link has been sent to your email address.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Check your inbox
                        </h3>
                        <p className="text-sm text-gray-600">
                            Click the verification link in the email we sent you to activate your account and start shopping.
                        </p>
                    </div>

                    {/* Resend Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Didn't receive the email?
                            </p>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {processing ? 'Sending...' : 'Resend verification email'}
                            </button>
                        </div>
                    </form>

                    {/* Help Text */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-600 space-y-2">
                            <p className="font-medium">Having trouble?</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Check your spam or junk folder</li>
                                <li>Make sure {user.email} is correct</li>
                                <li>Wait a few minutes for the email to arrive</li>
                                <li>Contact support if the issue persists</li>
                            </ul>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/dashboard"
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Continue to Dashboard
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        Need help?{' '}
                        <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                            Contact our support team
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
