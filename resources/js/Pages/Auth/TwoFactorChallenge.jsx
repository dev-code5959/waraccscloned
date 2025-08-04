// File: resources/js/Pages/Auth/TwoFactorChallenge.jsx

import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Shield,
    Smartphone,
    Key,
    ShoppingBag,
    AlertCircle
} from 'lucide-react';

export default function TwoFactorChallenge() {
    const [isRecoveryCode, setIsRecoveryCode] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });

    useEffect(() => {
        return () => {
            reset('code');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.login'));
    };

    const toggleRecoveryCode = () => {
        setIsRecoveryCode(!isRecoveryCode);
        setData('code', '');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Two-Factor Authentication" />

            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">ACCSZone</span>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {isRecoveryCode
                            ? 'Enter one of your recovery codes to sign in'
                            : 'Enter the 6-digit code from your authenticator app'
                        }
                    </p>
                </div>

                {/* 2FA Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form className="space-y-6" onSubmit={submit}>
                        {/* Code Input */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                {isRecoveryCode ? 'Recovery Code' : 'Authentication Code'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {isRecoveryCode ? (
                                        <Key className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Smartphone className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    autoComplete="one-time-code"
                                    required
                                    maxLength={isRecoveryCode ? 10 : 6}
                                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center font-mono text-lg tracking-widest ${errors.code ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                                        }`}
                                    placeholder={isRecoveryCode ? 'XXXXXXXX' : '000000'}
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.replace(/\s/g, '').toUpperCase())}
                                />
                            </div>
                            {errors.code && (
                                <div className="mt-2 flex items-center text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                                    {errors.code}
                                </div>
                            )}
                            {!isRecoveryCode && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Open your authenticator app and enter the 6-digit code
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing || data.code.length < (isRecoveryCode ? 6 : 6)}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <Shield className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                </span>
                                {processing ? 'Verifying...' : 'Verify & Sign In'}
                            </button>
                        </div>
                    </form>

                    {/* Toggle Recovery Code */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={toggleRecoveryCode}
                                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                {isRecoveryCode
                                    ? 'Use authenticator app instead'
                                    : 'Use a recovery code instead'
                                }
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">
                                {isRecoveryCode
                                    ? 'Recovery codes are one-time use backup codes that were provided when you enabled 2FA'
                                    : 'Lost your device? You can use a recovery code to regain access to your account'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-yellow-50 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Security Notice
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            If you're having trouble with two-factor authentication, please contact our support team. Never share your authentication codes with anyone.
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
                        Need help?{' '}
                        <a href="/contact" className="text-blue-400 hover:text-blue-300">
                            Contact our support team
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
