import { CheckCircle2 } from "lucide-react";

interface TaskCompletionRatesProps {
    completedTasks: number;
    inProgressTasks: number;
    inReviewTasks?: number;
    todoTasks: number;
    totalTasks: number;
    completionRate: number;
}

export default function TaskCompletionRates({
    completedTasks,
    inProgressTasks,
    inReviewTasks = 0,
    todoTasks,
    totalTasks,
    completionRate
}: TaskCompletionRatesProps) {
    const tasks = [
        { label: "Completed", count: completedTasks, color: "bg-green-600", textColor: "text-green-600", percent: completionRate },
        { label: "In Review", count: inReviewTasks, color: "bg-purple-600", textColor: "text-purple-600", percent: totalTasks > 0 ? (inReviewTasks / totalTasks) * 100 : 0 },
        { label: "In Progress", count: inProgressTasks, color: "bg-blue-600", textColor: "text-blue-600", percent: totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0 },
        { label: "To Do", count: todoTasks, color: "bg-gray-600", textColor: "text-gray-600", percent: totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0 }
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Task Completion Rates
            </h2>
            <div className="space-y-2">
                {tasks.map((task) => (
                    <div key={task.label}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-700">{task.label}</span>
                            <span className={`font-bold ${task.textColor}`}>{task.count} tasks</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full ${task.color} rounded-full transition-all`}
                                style={{ width: `${task.percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
