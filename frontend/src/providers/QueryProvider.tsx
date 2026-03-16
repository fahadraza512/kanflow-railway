'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: Data is considered fresh for 5 minutes
                        staleTime: 5 * 60 * 1000,
                        // Cache time: Unused data is garbage collected after 10 minutes
                        gcTime: 10 * 60 * 1000,
                        // Retry failed requests 3 times with exponential backoff
                        retry: 3,
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                        // Refetch on window focus
                        refetchOnWindowFocus: true,
                        // Refetch on reconnect
                        refetchOnReconnect: true,
                        // Don't refetch on mount if data is fresh
                        refetchOnMount: false,
                    },
                    mutations: {
                        // Retry failed mutations once
                        retry: 1,
                        retryDelay: 1000,
                    },
                },
            })
    );

    const [persister] = useState(() =>
        typeof window !== 'undefined'
            ? createSyncStoragePersister({
                  storage: window.localStorage,
                  key: 'REACT_QUERY_CACHE',
              })
            : undefined
    );

    if (persister) {
        return (
            <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{
                    persister,
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                    dehydrateOptions: {
                        shouldDehydrateQuery: (query) => {
                            // Only persist successful queries
                            return query.state.status === 'success';
                        },
                    },
                }}
            >
                {children}
                {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
                )}
            </PersistQueryClientProvider>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            )}
        </QueryClientProvider>
    );
}
