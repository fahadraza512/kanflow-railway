import { Flag } from "lucide-react";
import { clsx } from "clsx";
import { Priority } from "@/types/kanban";

interface PrioritySelectorProps {
    value: Priority;
    onChange: (priority: Priority) => void;
}

const priorities: Priority[] = ["low", "medium", "high", "urgent"];

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
    return (
        <div className="flex-1 min-w-[150px] space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <Flag className="w-3 h-3" />
                Priority
            </label>
            <div className="flex gap-1.5">
                {priorities.map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        className={clsx(
                            "flex-1 py-1 rounded-md text-xs font-semibold uppercase transition-colors",
                            value === p
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}
