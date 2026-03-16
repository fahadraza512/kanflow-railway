import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// API Configuration
// In production, use the absolute API URL. In development, use the Next.js proxy.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    withCredentials: true, // Enable sending cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token and CSRF token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add CSRF token from cookie if present
        const csrfToken = getCsrfTokenFromCookie();
        if (csrfToken) {
            config.headers['x-csrf-token'] = csrfToken;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Helper function to get CSRF token from cookies
function getCsrfTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const name = 'csrf-token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length);
        }
    }
    
    return null;
}

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const requestUrl = error.config?.url || '';
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Don't redirect if it's a login attempt - let the login page handle the error
            if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
                useAuthStore.getState().logout();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access denied:', error.response.data);
        }

        // Handle 429 Too Many Requests (Rate Limiting)
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            console.warn(`Rate limited. Retry after: ${retryAfter} seconds`);
        }

        // Handle 500 Server Error
        if (error.response?.status === 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

// Generic API error type
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: any;
}

// Transform axios error to ApiError
export function handleApiError(error: unknown): any {
    if (axios.isAxiosError(error)) {
        // Extract error message with better fallback logic
        let errorMessage = 'An error occurred';
        
        if (error.response?.data) {
            // Safely try different possible error message fields
            const data = error.response.data;
            errorMessage = (typeof data === 'object' && data !== null)
                ? (data.message || data.error || data.statusText || errorMessage)
                : (typeof data === 'string' ? data : errorMessage);
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // Add status code to message if available for better debugging
        if (error.response?.status && error.response.status >= 400) {
            const statusText = error.response.statusText || '';
            if (!errorMessage.includes(error.response.status.toString())) {
                errorMessage = `${errorMessage} (${error.response.status}${statusText ? ' ' + statusText : ''})`;
            }
        }
        
        // Preserve the original error structure for better error handling
        const apiError = {
            message: errorMessage,
            code: error.response?.data?.code || error.code,
            status: error.response?.status,
            details: error.response?.data?.details || error.response?.data?.errors,
            response: error.response, // Preserve full response for detailed error handling
        };
        
        // Log error for debugging
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: apiError.status,
            message: apiError.message,
            details: apiError.details,
        });
        
        // Throw error with preserved structure
        const enhancedError: any = new Error(apiError.message);
        enhancedError.response = error.response;
        enhancedError.status = apiError.status;
        enhancedError.code = apiError.code;
        enhancedError.details = apiError.details;
        
        return enhancedError;
    }
    
    if (error instanceof Error) {
        console.error('Non-Axios Error:', error);
        return error;
    }
    
    console.error('Unknown Error:', error);
    return new Error('An unknown error occurred');
}

// Generic API response type
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

// Generic paginated response
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Base service class with common CRUD operations
export class BaseService<T = any> {
    protected client = apiClient;
    
    constructor(protected endpoint: string = '') {}

    async get<R = T>(url: string, params?: Record<string, any>): Promise<ApiResponse<R>> {
        const response = await apiClient.get<ApiResponse<R>>(url, { params });
        return response.data;
    }

    async getAll(params?: Record<string, any>): Promise<T[]> {
        const response = await apiClient.get<ApiResponse<T[]>>(this.endpoint, { params });
        return response.data.data;
    }

    async getById(id: string | number): Promise<T> {
        const response = await apiClient.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
        return response.data.data;
    }

    async create(data: Partial<T>): Promise<T> {
        const response = await apiClient.post<ApiResponse<T>>(this.endpoint, data);
        return response.data.data;
    }

    async update(id: string | number, data: Partial<T>): Promise<T> {
        console.log('[BaseService.update] START - endpoint:', this.endpoint, 'id:', id, 'data:', data);
        const url = `${this.endpoint}/${id}`;
        console.log('[BaseService.update] Making PATCH request to:', url);
        const response = await apiClient.patch<ApiResponse<T>>(url, data);
        console.log('[BaseService.update] Response received:', response.data);
        return response.data.data;
    }

    async delete(id: string | number): Promise<void> {
        await apiClient.delete(`${this.endpoint}/${id}`);
    }
}
