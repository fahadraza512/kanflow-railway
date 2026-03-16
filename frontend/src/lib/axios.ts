import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const axiosInstance = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for token injection
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for 401 handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth and redirect to login
            useAuthStore.getState().logout();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
