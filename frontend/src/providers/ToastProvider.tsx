'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // Default options
                duration: 5000,
                style: {
                    background: '#fff',
                    color: '#363636',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
                // Success
                success: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                    style: {
                        border: '1px solid #d1fae5',
                        background: '#f0fdf4',
                    },
                },
                // Error
                error: {
                    duration: 6000,
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                    },
                },
                // Loading
                loading: {
                    iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
