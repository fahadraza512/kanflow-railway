import { clsx } from 'clsx';

interface SkeletonLoaderProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    count?: number;
}

export default function SkeletonLoader({
    className,
    variant = 'text',
    width,
    height,
    count = 1,
}: SkeletonLoaderProps) {
    const baseClasses = 'animate-pulse bg-gray-200';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px'),
    };

    if (count === 1) {
        return (
            <div
                className={clsx(baseClasses, variantClasses[variant], className)}
                style={style}
            />
        );
    }

    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={clsx(baseClasses, variantClasses[variant], className)}
                    style={style}
                />
            ))}
        </div>
    );
}

// Preset skeleton components
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <SkeletonLoader variant="rectangular" height={120} />
            <SkeletonLoader variant="text" width="60%" />
            <SkeletonLoader variant="text" width="80%" />
            <div className="flex gap-2 pt-2">
                <SkeletonLoader variant="circular" width={32} height={32} />
                <SkeletonLoader variant="text" width="40%" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex gap-4 items-center p-4 bg-white rounded-lg border border-gray-200">
                    <SkeletonLoader variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-2">
                        <SkeletonLoader variant="text" width="30%" />
                        <SkeletonLoader variant="text" width="50%" />
                    </div>
                    <SkeletonLoader variant="rectangular" width={80} height={32} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                    <SkeletonLoader variant="circular" width={48} height={48} />
                    <div className="flex-1 space-y-2">
                        <SkeletonLoader variant="text" width="40%" />
                        <SkeletonLoader variant="text" width="60%" />
                    </div>
                </div>
            ))}
        </div>
    );
}
