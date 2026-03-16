import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  tooltip?: string;
}

export function IconButton({
  icon,
  variant = "default",
  size = "md",
  tooltip,
  className,
  ...props
}: IconButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    primary: "text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    danger: "text-red-600 hover:bg-red-50 focus:ring-red-500",
    ghost: "text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:ring-gray-500"
  };

  const sizes = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
    lg: "w-11 h-11 text-lg"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
}
