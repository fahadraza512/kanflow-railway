import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
    content: string;
    children: ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    className?: string;
}

export function Tooltip({ content, children, side = "right", className }: TooltipProps) {
    const sideClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
    };

    return (
        <div className="relative group block w-full">
            {children}
            <span
                className={cn(
                    "absolute hidden group-hover:block",
                    "bg-gray-900 text-white text-xs px-2 py-1 rounded",
                    "whitespace-nowrap z-50 pointer-events-none",
                    "animate-fadeIn",
                    sideClasses[side],
                    className
                )}
                role="tooltip"
            >
                {content}
            </span>
        </div>
    );
}
