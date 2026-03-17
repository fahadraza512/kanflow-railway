import { Target, Activity, CheckCircle2, TrendingUp } from "lucide-react";

interface KeyMetricsProps {
    totalProjects: number;
    totalBoards: number;
    completedTasks: number;
    completionRate: number;
}

export default function KeyMetrics({
    totalProjects,
    totalBoards,
    completedTasks,
    completionRate
}: KeyMetricsProps) {
    const metrics = [
        {
            label: "Projects",
            value: totalProjects,
            description: "Active projects",
            icon: Target,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            label: "Boards",
            value: totalBoards,
            description: "Total boards",
            icon: Activity,
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            label: "Completed",
            value: completedTasks,
            description: "Tasks completed",
            icon: CheckCircle2,
            bgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            label: "Rate",
            value: `${completionRate}%`,
            description: "Completion rate",
            icon: TrendingUp,
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {metrics.map((metric, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                            <metric.icon className={`w-4 h-4 ${metric.iconColor}`} />
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{metric.label}</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-0.5">{metric.value}</div>
                    <p className="text-[10px] text-gray-500 font-medium">{metric.description}</p>
                </div>
            ))}
        </div>
    );
}
