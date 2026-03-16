import { Folder, Layout, CheckCircle2, Clock, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCard {
    label: string;
    value: number;
    icon: LucideIcon;
    color: "blue" | "purple" | "green" | "orange";
}

interface DashboardStatsProps {
    totalProjects: number;
    totalBoards: number;
    totalTasks: number;
    inProgressTasks: number;
}

export default function DashboardStats({
    totalProjects,
    totalBoards,
    totalTasks,
    inProgressTasks
}: DashboardStatsProps) {
    const statsCards: StatCard[] = [
        { label: "Total Projects", value: totalProjects, icon: Folder, color: "blue" },
        { label: "Active Boards", value: totalBoards, icon: Layout, color: "purple" },
        { label: "Total Tasks", value: totalTasks, icon: CheckCircle2, color: "green" },
        { label: "In Progress", value: inProgressTasks, icon: Clock, color: "orange" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {statsCards.map((stat, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            stat.color === "blue" && "bg-blue-100 text-blue-600",
                            stat.color === "purple" && "bg-purple-100 text-purple-600",
                            stat.color === "green" && "bg-green-100 text-green-600",
                            stat.color === "orange" && "bg-orange-100 text-orange-600"
                        )}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-0.5">
                        {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
