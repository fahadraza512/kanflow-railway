import { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: "default" | "bordered" | "elevated";
    padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ 
    children, 
    variant = "default", 
    padding = "md",
    className,
    ...props 
}: CardProps) {
    const variants = {
        default: "bg-white border border-gray-200",
        bordered: "bg-white border-2 border-gray-300",
        elevated: "bg-white shadow-lg border border-gray-100"
    };
    
    const paddings = {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6"
    };
    
    return (
        <div
            className={clsx(
                "rounded-lg",
                variants[variant],
                paddings[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    divider?: boolean;
}

export function CardHeader({ children, divider = false, className, ...props }: CardHeaderProps) {
    return (
        <div
            className={clsx(
                "mb-4",
                divider && "pb-4 border-b border-gray-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
    return (
        <div className={clsx("", className)} {...props}>
            {children}
        </div>
    );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    divider?: boolean;
}

export function CardFooter({ children, divider = false, className, ...props }: CardFooterProps) {
    return (
        <div
            className={clsx(
                "mt-4",
                divider && "pt-4 border-t border-gray-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
