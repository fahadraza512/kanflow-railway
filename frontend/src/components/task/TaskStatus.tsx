import { clsx } from "clsx";
import { TaskStatus as Status } from "@/types/kanban";

interface TaskStatusProps {
    currentStatus: Status;
    readOnly?: boolean;
    onChange: (status: Status) => void;
}

export default function TaskStatus({
    currentStatus,
    readOnly,
    onChange
}: TaskStatusProps) {
    const statuses: Status[] = ["todo", "inProgress", "inReview", "done"];
    
    const getStatusColors = (s: Status) => {
        const colors = {
            todo: currentStatus === s ? "bg-gray-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50",
            inProgress: currentStatus === s ? "bg-blue-500 text-white shadow-sm" : "text-blue-600 hover:bg-blue-50",
            inReview: currentStatus === s ? "bg-yellow-500 text-white shadow-sm" : "text-yellow-600 hover:bg-yellow-50",
            done: currentStatus === s ? "bg-green-500 text-white shadow-sm" : "text-green-600 hover:bg-green-50"
        };
        return colors[s];
    };
    
    const getStatusLabel = (s: Status) => {
        const labels = {
            todo: "To Do",
            inProgress: "In Progress",
            inReview: "In Review",
            done: "Done"
        };
        return labels[s];
    };

    return (
        <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
                Status
            </label>
            <div className="grid grid-cols-2 gap-1">
                {statuses.map((s) => (
                    <button
                        key={s}
                        disabled={readOnly}
                        onClick={() => onChange(s)}
                        className={clsx(
                            "py-1 text-[9px] font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            getStatusColors(s)
                        )}
                    >
                        {getStatusLabel(s)}
                    </button>
                ))}
            </div>
        </div>
    );
}
