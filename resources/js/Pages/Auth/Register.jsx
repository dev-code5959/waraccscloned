// File: resources/js/Pages/Auth/Register.jsx

import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    UserPlus,
    ShoppingBag,
    Gift,
    Check
} from 'lucide-react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        referral_code: '',
        terms: false,
    });

    useEffect(() => {
        // Get referral code from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            setData('referral_code', refCode);
        }

        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Create Account" />

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
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link
                            href={route('login')}
                            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form className="space-y-6" onSubmit={submit}>
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.name ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                                        }`}
                                    placeholder="Enter your full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

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
                                    placeholder="Enter your email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                                        }`}
                                    placeholder="Choose a strong password"
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
                            <div className="mt-2 text-xs text-gray-500">
                                Password must be at least 8 characters with mixed case, numbers, and symbols
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    className={`block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.password_confirmation ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                                        }`}
                                    placeholder="Confirm your password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        {/* Referral Code Field */}
                        <div>
                            <label htmlFor="referral_code" className="block text-sm font-medium text-gray-700 mb-2">
                                Referral Code (Optional)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Gift className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="referral_code"
                                    name="referral_code"
                                    type="text"
                                    className={`block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.referral_code ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : ''
                                        }`}
                                    placeholder="Enter referral code"
                                    value={data.referral_code}
                                    onChange={(e) => setData('referral_code', e.target.value.toUpperCase())}
                                />
                            </div>
                            {errors.referral_code && (
                                <p className="mt-2 text-sm text-red-600">{errors.referral_code}</p>
                            )}
                            {data.referral_code && (
                                <p className="mt-2 text-sm text-green-600 flex items-center">
                                    <Gift className="h-4 w-4 mr-1" />
                                    You'll help your referrer earn commission!
                                </p>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${errors.terms ? 'border-red-300' : ''
                                            }`}
                                        checked={data.terms}
                                        onChange={(e) => setData('terms', e.target.checked)}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="text-gray-700">
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-blue-600 hover:text-blue-500" target="_blank">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="text-blue-600 hover:text-blue-500" target="_blank">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>
                            </div>
                            {errors.terms && (
                                <p className="mt-2 text-sm text-red-600">{errors.terms}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing || !data.terms}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
                                </span>
                                {processing ? 'Creating account...' : 'Create account'}
                            </button>
                        </div>
                    </form>

                    {/* Benefits */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Why join ACCSZone?</p>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                Instant delivery of digital products
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                Secure crypto payments
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                24/7 customer support
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                Earn through referral program
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
