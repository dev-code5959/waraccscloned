// File: resources/js/Pages/Auth/ForgotPassword.jsx

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Mail,
    ArrowLeft,
    Send,
    ShoppingBag,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Forgot Password" />

            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">ACCSZone</span>
                    </Link>
                    <h2 className="text-3xl font-bold text-white">
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-800">{status}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form className="space-y-6" onSubmit={submit}>
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                                        }`}
                                    placeholder="Enter your email address"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <Send className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                </span>
                                {processing ? 'Sending...' : 'Email password reset link'}
                            </button>
                        </div>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to sign in
                            </Link>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            If you don't receive an email within a few minutes, check your spam folder or{' '}
                            <Link href="/contact" className="text-blue-600 hover:text-blue-500">
                                contact support
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Additional Help */}
                <div className="text-center">
                    <p className="text-sm text-gray-400">
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
