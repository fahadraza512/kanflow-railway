import { Zap } from "lucide-react";
import { clsx } from "clsx";

interface PriorityDistributionProps {
    priorityDistribution: { low: number; medium: number; high: number; urgent: number };
    totalTasks: number;
}

export default function PriorityDistribution({
    priorityDistribution,
    totalTasks
}: PriorityDistributionProps) {
    const priorities = [
        { key: "urgent", label: "Urgent", color: "bg-red-600" },
        { key: "high", label: "High", color: "bg-orange-600" },
        { key: "medium", label: "Medium", color: "bg-yellow-600" },
        { key: "low", label: "Low", color: "bg-green-600" }
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-600" />
                Priority Distribution
            </h2>
            <div className="space-y-2">
                {priorities.map(({ key, label, color }) => {
                    const count = priorityDistribution[key as keyof typeof priorityDistribution];
                    const percent = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                    
                    return (
                        <div key={key}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-gray-700">{label}</span>
                                <span className="font-bold text-gray-900">{count} tasks</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className={clsx("h-full rounded-full transition-all", color)}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
