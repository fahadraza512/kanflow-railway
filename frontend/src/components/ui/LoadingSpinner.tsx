import { clsx } from 'clsx';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    color?: 'primary' | 'white' | 'gray';
}

export default function LoadingSpinner({ 
    size = 'md', 
    className,
    color = 'primary' 
}: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4',
    };

    const colors = {
        primary: 'border-blue-600 border-t-transparent',
        white: 'border-white border-t-transparent',
        gray: 'border-gray-600 border-t-transparent',
    };

    return (
        <div
            className={clsx(
                'animate-spin rounded-full',
                sizes[size],
                colors[color],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
