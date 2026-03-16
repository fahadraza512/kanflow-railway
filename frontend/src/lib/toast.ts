import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Wrapper around react-hot-toast for consistent notifications
 */

export const showToast = {
    /**
     * Show success message
     */
    success: (message: string) => {
        toast.success(message);
    },

    /**
     * Show error message
     */
    error: (message: string) => {
        toast.error(message);
    },

    /**
     * Show loading message
     */
    loading: (message: string) => {
        return toast.loading(message);
    },

    /**
     * Show info message
     */
    info: (message: string) => {
        toast(message, {
            icon: 'ℹ️',
        });
    },

    /**
     * Show warning message
     */
    warning: (message: string) => {
        toast(message, {
            icon: '⚠️',
            style: {
                border: '1px solid #fef3c7',
                background: '#fffbeb',
            },
        });
    },

    /**
     * Dismiss a specific toast
     */
    dismiss: (toastId: string) => {
        toast.dismiss(toastId);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll: () => {
        toast.dismiss();
    },

    /**
     * Show promise-based toast
     * Automatically shows loading, success, or error based on promise result
     */
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return toast.promise(promise, messages);
    },
};

/**
 * Show API error toast with formatted message
 */
export function showApiError(error: any, defaultMessage = 'An error occurred') {
    const message = error?.message || error?.data?.message || defaultMessage;
    showToast.error(message);
}

/**
 * Show validation error toast
 */
export function showValidationError(errors: Record<string, string>) {
    const firstError = Object.values(errors)[0];
    if (firstError) {
        showToast.error(firstError);
    }
}
