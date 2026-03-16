import { SubtaskProgress as Progress } from "@/types/subtask";
import { CheckCircle2 } from "lucide-react";

interface SubtaskProgressProps {
  progress: Progress;
  size?: "sm" | "md";
}

export function SubtaskProgress({ progress, size = "md" }: SubtaskProgressProps) {
  if (progress.total === 0) return null;

  const sizeClasses = {
    sm: "text-xs h-1",
    md: "text-sm h-2",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-gray-600 ${sizeClasses[size]}`}>
          <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
          <span className="font-medium">
            {progress.completed}/{progress.total} completed
          </span>
        </div>
        <span className={`font-semibold text-gray-700 ${sizeClasses[size]}`}>
          {progress.percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`bg-blue-600 ${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
