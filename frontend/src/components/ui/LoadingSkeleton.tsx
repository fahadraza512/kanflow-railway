import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
    className?: string;
    variant?: "card" | "text" | "circle" | "button";
    count?: number;
}

export function LoadingSkeleton({ className, variant = "text", count = 1 }: LoadingSkeletonProps) {
    const baseClasses = "animate-pulse bg-gray-200 rounded";
    
    const variantClasses = {
        card: "h-32 w-full",
        text: "h-4 w-full",
        circle: "h-10 w-10 rounded-full",
        button: "h-10 w-24",
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn(baseClasses, variantClasses[variant], className)}
                />
            ))}
        </>
    );
}

export function TaskCardSkeleton() {
    return (
        <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
            <LoadingSkeleton className="h-4 w-3/4 mb-2" />
            <LoadingSkeleton className="h-3 w-1/2 mb-2" />
            <div className="flex gap-1 mb-2">
                <LoadingSkeleton className="h-5 w-16" />
                <LoadingSkeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <LoadingSkeleton variant="circle" className="w-5 h-5" />
                <LoadingSkeleton className="h-3 w-8" />
            </div>
        </div>
    );
}

export function TaskDetailSkeleton() {
    return (
        <div className="p-3 sm:p-4 lg:p-2 space-y-3">
            <LoadingSkeleton className="h-6 w-3/4 mb-4" />
            <LoadingSkeleton className="h-20 w-full mb-4" />
            
            <div className="space-y-3">
                <div>
                    <LoadingSkeleton className="h-3 w-16 mb-2" />
                    <LoadingSkeleton className="h-10 w-full" />
                </div>
                <div>
                    <LoadingSkeleton className="h-3 w-16 mb-2" />
                    <LoadingSkeleton className="h-10 w-full" />
                </div>
                <div>
                    <LoadingSkeleton className="h-3 w-16 mb-2" />
                    <LoadingSkeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

export function ActivityFeedSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-2">
                    <LoadingSkeleton variant="circle" className="w-6 h-6" />
                    <div className="flex-1">
                        <LoadingSkeleton className="h-3 w-3/4 mb-1" />
                        <LoadingSkeleton className="h-2 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function BoardColumnSkeleton() {
    return (
        <div className="w-[260px] h-full shrink-0 flex flex-col">
            <div className="p-3">
                <LoadingSkeleton className="h-4 w-24" />
            </div>
            <div className="flex-1 p-1 space-y-2">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
            </div>
        </div>
    );
}
