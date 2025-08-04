// File: resources/js/bootstrap.js

import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF Token
let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Response interceptor for handling authentication errors
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            // Handle forbidden access
            console.error('Access forbidden:', error.response.data.message);
        } else if (error.response?.status === 419) {
            // CSRF token mismatch - refresh page
            window.location.reload();
        }

        return Promise.reject(error);
    }
);

// Request interceptor for adding loading states
window.axios.interceptors.request.use(
    (config) => {
        // Add loading indicator logic here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Service Worker registration (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
