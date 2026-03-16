import { clsx } from "clsx";

interface TaskDueDateProps {
    dueDate: string | null;
    readOnly?: boolean;
    onChange: (dueDate: string) => void;
}

export default function TaskDueDate({
    dueDate,
    readOnly,
    onChange
}: TaskDueDateProps) {
    const getRelativeDueDate = (date: string | null) => {
        if (!date) return null;
        
        const due = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, color: 'text-red-600' };
        if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
        if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' };
        if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'text-blue-600' };
        return { text: `Due in ${diffDays} days`, color: 'text-gray-600' };
    };

    const relativeDueDate = getRelativeDueDate(dueDate);

    return (
        <div className="flex flex-col gap-0.5">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">Due Date</label>
            <div className="flex items-center gap-1.5">
                <input
                    type="date"
                    value={dueDate || ""}
                    onChange={(e) => !readOnly && onChange(e.target.value)}
                    disabled={readOnly}
                    className="flex-1 px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded-lg text-[9px] text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                />
                {relativeDueDate && (
                    <span className={clsx("text-[9px] font-semibold", relativeDueDate.color)}>
                        {relativeDueDate.text}
                    </span>
                )}
            </div>
        </div>
    );
}
