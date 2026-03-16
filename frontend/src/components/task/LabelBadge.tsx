import { Label } from "@/types/label";
import { X } from "lucide-react";

interface LabelBadgeProps {
  label: Label;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function LabelBadge({ label, onRemove, size = "md" }: LabelBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: label.color }}
    >
      {label.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
          aria-label="Remove label"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
