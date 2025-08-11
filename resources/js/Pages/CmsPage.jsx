// File: resources/js/Pages/CmsPage.jsx

import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { FileText, Clock, User } from 'lucide-react';

export default function CmsPage({ page, meta }) {
    return (
        <AppLayout>
            <Head title={meta.title} />

            {/* Header Section */}
            <div className="bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center mb-4">
                        <FileText className="h-8 w-8 text-blue-400 mr-3" />
                        <h1 className="text-3xl font-bold">{page.title}</h1>
                    </div>
                    {page.excerpt && (
                        <p className="text-xl text-gray-300 leading-relaxed">
                            {page.excerpt}
                        </p>
                    )}
                    {(page.updated_at || page.author) && (
                        <div className="flex items-center mt-6 text-sm text-gray-400">
                            {page.updated_at && (
                                <div className="flex items-center mr-6">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Last updated: {new Date(page.updated_at).toLocaleDateString()}</span>
                                </div>
                            )}
                            {page.author && (
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    <span>By {page.author}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="prose prose-lg max-w-none">
                        <div
                            dangerouslySetInnerHTML={{ __html: page.content }}
                            className="cms-content"
                        />
                    </div>
                </div>
            </div>

            {/* Contact CTA Section (for non-contact pages) */}
            {page.slug !== 'contact' && (
                <div className="bg-gray-50 border-t">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Still have questions?
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Our support team is here to help you get the answers you need.
                            </p>
                            <a
                                href="/contact"
                                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
