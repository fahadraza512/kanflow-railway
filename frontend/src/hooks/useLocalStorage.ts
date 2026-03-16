import { useState, useEffect } from 'react';

// Custom event for localStorage changes
const STORAGE_EVENT = 'local-storage-change';

// Dispatch custom event when localStorage changes
export function dispatchStorageEvent(key: string) {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

// Hook to listen to localStorage changes
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                dispatchStorageEvent(key);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const handleStorageChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.key === key) {
                try {
                    const item = window.localStorage.getItem(key);
                    setStoredValue(item ? JSON.parse(item) : initialValue);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        window.addEventListener(STORAGE_EVENT, handleStorageChange);
        return () => window.removeEventListener(STORAGE_EVENT, handleStorageChange);
    }, [key, initialValue]);

    return [storedValue, setValue] as const;
}

// Hook to force refresh when any storage key changes
export function useStorageListener(callback: () => void, keys?: string[]) {
    useEffect(() => {
        const handleStorageChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (!keys || keys.includes(customEvent.detail?.key)) {
                callback();
            }
        };

        window.addEventListener(STORAGE_EVENT, handleStorageChange);
        return () => window.removeEventListener(STORAGE_EVENT, handleStorageChange);
    }, [callback, keys]);
}
