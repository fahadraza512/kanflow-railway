import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse"
}: SkeletonProps) {
  const baseClasses = "bg-gray-200";
  
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: ""
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
}

// Preset skeleton components
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" height={16} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-4", className)}>
      <Skeleton height={20} className="mb-3" />
      <SkeletonText lines={2} />
      <div className="flex gap-2 mt-4">
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton height={36} className={cn("rounded-lg", className)} />;
}
