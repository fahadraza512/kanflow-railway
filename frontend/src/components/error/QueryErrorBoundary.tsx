'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import ErrorBoundary from './ErrorBoundary';
import { ReactNode } from 'react';

interface QueryErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Error boundary specifically for React Query errors
 * Provides reset functionality that works with React Query
 */
export default function QueryErrorBoundary({ children, fallback }: QueryErrorBoundaryProps) {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    onError={(error) => {
                        console.error('Query error:', error);
                    }}
                    fallback={fallback}
                >
                    {children}
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
}
