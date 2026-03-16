import { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { User } from "lucide-react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    name?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    variant?: "circle" | "rounded" | "square";
    fallbackColor?: string;
}

export default function Avatar({
    src,
    alt,
    name,
    size = "md",
    variant = "circle",
    fallbackColor = "bg-blue-600",
    className,
    ...props
}: AvatarProps) {
    const sizes = {
        xs: "w-6 h-6 text-[10px]",
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg"
    };
    
    const variants = {
        circle: "rounded-full",
        rounded: "rounded-lg",
        square: "rounded-none"
    };
    
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    
    return (
        <div
            className={clsx(
                "flex items-center justify-center overflow-hidden border-2 border-white shadow-sm",
                sizes[size],
                variants[variant],
                className
            )}
            {...props}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt || name || "Avatar"}
                    className="w-full h-full object-cover"
                />
            ) : name ? (
                <div className={clsx(
                    "w-full h-full flex items-center justify-center font-bold text-white",
                    fallbackColor
                )}>
                    {getInitials(name)}
                </div>
            ) : (
                <div className={clsx(
                    "w-full h-full flex items-center justify-center text-gray-400",
                    "bg-gray-100"
                )}>
                    <User className="w-1/2 h-1/2" />
                </div>
            )}
        </div>
    );
}
