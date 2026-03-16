import { HTMLAttributes } from "react";
import { clsx } from "clsx";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
    variant?: "solid" | "dashed" | "dotted";
    spacing?: "none" | "sm" | "md" | "lg";
    label?: string;
}

export default function Divider({
    orientation = "horizontal",
    variant = "solid",
    spacing = "md",
    label,
    className,
    ...props
}: DividerProps) {
    const variants = {
        solid: "border-solid",
        dashed: "border-dashed",
        dotted: "border-dotted"
    };
    
    const spacings = {
        none: "",
        sm: orientation === "horizontal" ? "my-2" : "mx-2",
        md: orientation === "horizontal" ? "my-4" : "mx-4",
        lg: orientation === "horizontal" ? "my-6" : "mx-6"
    };
    
    if (label && orientation === "horizontal") {
        return (
            <div className={clsx("flex items-center", spacings[spacing], className)} {...props}>
                <div className={clsx("flex-1 border-t border-gray-200", variants[variant])} />
                <span className="px-3 text-sm text-gray-500 font-medium">{label}</span>
                <div className={clsx("flex-1 border-t border-gray-200", variants[variant])} />
            </div>
        );
    }
    
    return (
        <div
            className={clsx(
                "border-gray-200",
                variants[variant],
                spacings[spacing],
                orientation === "horizontal" ? "border-t w-full" : "border-l h-full",
                className
            )}
            role="separator"
            {...props}
        />
    );
}
