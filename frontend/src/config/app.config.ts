/**
 * Application Configuration
 * 
 * This file contains feature flags and configuration settings
 * to control the behavior of the application.
 */

// Feature Flags
export const FEATURE_FLAGS = {
    // Toggle between localStorage and API backend
    USE_API_BACKEND: process.env.NEXT_PUBLIC_USE_API === 'true',
    
    // Enable/disable specific features
    ENABLE_2FA: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
    
    // Development features
    ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development',
    ENABLE_MOCK_DATA: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
} as const;

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
} as const;

// Storage Configuration
export const STORAGE_CONFIG = {
    // localStorage keys
    AUTH_TOKEN_KEY: 'auth-token',
    REFRESH_TOKEN_KEY: 'refresh-token',
    USER_KEY: 'current-user',
    WORKSPACE_KEY: 'active-workspace',
    
    // Session storage keys
    SESSION_ID_KEY: 'session-id',
} as const;

// Validation Configuration
export const VALIDATION_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 255,
    DESCRIPTION_MAX_LENGTH: 1000,
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
} as const;

// Date/Time Configuration
export const DATETIME_CONFIG = {
    DATE_FORMAT: 'MMM dd, yyyy',
    TIME_FORMAT: 'HH:mm',
    DATETIME_FORMAT: 'MMM dd, yyyy HH:mm',
    TIMEZONE: 'UTC',
} as const;

// UI Configuration
export const UI_CONFIG = {
    TOAST_DURATION: 5000, // 5 seconds
    DEBOUNCE_DELAY: 300, // 300ms
    ANIMATION_DURATION: 200, // 200ms
} as const;

// Export helper function to check if API backend is enabled
export function isApiBackendEnabled(): boolean {
    return FEATURE_FLAGS.USE_API_BACKEND;
}

// Export helper function to check if localStorage fallback should be used
export function shouldUseLocalStorage(): boolean {
    return !FEATURE_FLAGS.USE_API_BACKEND || FEATURE_FLAGS.ENABLE_OFFLINE_MODE;
}
