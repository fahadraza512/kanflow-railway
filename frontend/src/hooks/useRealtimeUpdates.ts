import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeConfig {
    enabled?: boolean;
    interval?: number; // in milliseconds
    queryKeys: string[][]; // Array of query keys to invalidate
}

/**
 * Hook for real-time updates using polling
 * Automatically refetches data at specified intervals
 */
export function useRealtimeUpdates({
    enabled = true,
    interval = 30000, // Default: 30 seconds
    queryKeys
}: RealtimeConfig) {
    const queryClient = useQueryClient();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled || queryKeys.length === 0) {
            return;
        }

        // Set up polling interval
        intervalRef.current = setInterval(() => {
            // Invalidate all specified query keys to trigger refetch
            queryKeys.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey });
            });
        }, interval);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval, queryKeys, queryClient]);

    // Manual refresh function
    const refresh = () => {
        queryKeys.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
        });
    };

    return { refresh };
}

/**
 * Hook for visibility-based polling
 * Only polls when tab is visible to save resources
 */
export function useVisibilityPolling({
    enabled = true,
    interval = 30000,
    queryKeys
}: RealtimeConfig) {
    const queryClient = useQueryClient();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isVisibleRef = useRef(true);

    useEffect(() => {
        if (!enabled || queryKeys.length === 0) {
            return;
        }

        // Handle visibility change
        const handleVisibilityChange = () => {
            isVisibleRef.current = !document.hidden;
            
            if (isVisibleRef.current) {
                // Tab became visible - refresh immediately
                queryKeys.forEach(queryKey => {
                    queryClient.invalidateQueries({ queryKey });
                });
                
                // Restart polling
                startPolling();
            } else {
                // Tab hidden - stop polling
                stopPolling();
            }
        };

        const startPolling = () => {
            stopPolling(); // Clear any existing interval
            
            intervalRef.current = setInterval(() => {
                if (isVisibleRef.current) {
                    queryKeys.forEach(queryKey => {
                        queryClient.invalidateQueries({ queryKey });
                    });
                }
            }, interval);
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Start polling if visible
        if (isVisibleRef.current) {
            startPolling();
        }

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopPolling();
        };
    }, [enabled, interval, queryKeys, queryClient]);
}
