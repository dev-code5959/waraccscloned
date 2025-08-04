// File: resources/js/Pages/Auth/ConfirmPassword.jsx

import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Lock,
    Eye,
    EyeOff,
    Shield,
    ShoppingBag
} from 'lucide-react';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Confirm Password" />

            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">ACCSZone</span>
                    </div>
                    <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                        Confirm your password
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        This is a secure area. Please confirm your password before continuing.
                    </p>
                </div>

                {/* Confirm Password Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form className="space-y-6" onSubmit={submit}>
                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                                        }`}
                                    placeholder="Enter your current password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
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
                                    <Shield className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                </span>
                                {processing ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </form>

                    {/* Security Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Shield className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Why do we need this?
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            You're accessing a sensitive area of your account. We require password confirmation to ensure your account security and protect your personal information.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        Having trouble?{' '}
                        <a href="/contact" className="text-blue-400 hover:text-blue-300">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
