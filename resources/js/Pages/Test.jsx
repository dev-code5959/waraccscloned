import React from 'react';

const Test = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Tailwind CSS Test</h1>
                <div className="space-y-4">
                    <p className="text-gray-600">
                        This is a test page to verify Tailwind CSS is working correctly.
                    </p>
                    <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                        <p>If you see this styled box, Tailwind CSS is working!</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Test Button
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Test;
