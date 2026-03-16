import { clsx } from "clsx";
import { Priority } from "@/types/kanban";

interface TaskPriorityProps {
    currentPriority: Priority;
    readOnly?: boolean;
    onChange: (priority: Priority) => void;
}

export default function TaskPriority({
    currentPriority,
    readOnly,
    onChange
}: TaskPriorityProps) {
    const priorities: Priority[] = ["low", "medium", "high", "urgent"];

    const getPriorityColors = (p: Priority) => {
        const colors = {
            low: currentPriority === p ? "bg-green-500 text-white shadow-sm" : "text-green-600 hover:bg-green-50",
            medium: currentPriority === p ? "bg-yellow-500 text-white shadow-sm" : "text-yellow-600 hover:bg-yellow-50",
            high: currentPriority === p ? "bg-orange-500 text-white shadow-sm" : "text-orange-600 hover:bg-orange-50",
            urgent: currentPriority === p ? "bg-red-500 text-white shadow-sm" : "text-red-600 hover:bg-red-50"
        };
        return colors[p];
    };

    return (
        <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">Priority</label>
            <div className="flex bg-gray-50 p-0.5 rounded-lg gap-0.5">
                {priorities.map((p) => (
                    <button
                        key={p}
                        disabled={readOnly}
                        onClick={() => onChange(p)}
                        className={clsx(
                            "flex-1 py-0.5 text-[9px] font-semibold rounded transition-colors capitalize",
                            getPriorityColors(p)
                        )}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}
