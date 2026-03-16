import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
}

export default function Card({ 
    children, 
    className, 
    padding = "md",
    hover = false 
}: CardProps) {
    const paddingClasses = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
    };

    return (
        <div
            className={clsx(
                "bg-white rounded-lg border border-gray-200 shadow-md",
                paddingClasses[padding],
                hover && "hover:shadow-lg transition-shadow cursor-pointer",
                className
            )}
        >
            {children}
        </div>
    );
}
