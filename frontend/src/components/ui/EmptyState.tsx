import { ReactNode } from "react";
import { clsx } from "clsx";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={clsx("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                {icon || <Inbox className="w-8 h-8 text-gray-400" />}
            </div>
            
            <h3 className="text-base font-bold text-gray-900 mb-2">
                {title}
            </h3>
            
            {description && (
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                    {description}
                </p>
            )}
            
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
