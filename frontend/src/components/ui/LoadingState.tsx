import LoadingSpinner from './LoadingSpinner';
import { clsx } from 'clsx';

interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function LoadingState({
    message = 'Loading...',
    fullScreen = false,
    size = 'lg',
    className,
}: LoadingStateProps) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size={size} />
            {message && (
                <p className="text-sm text-gray-600 animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className={clsx('min-h-screen flex items-center justify-center bg-gray-50', className)}>
                {content}
            </div>
        );
    }

    return (
        <div className={clsx('flex items-center justify-center p-8', className)}>
            {content}
        </div>
    );
}
