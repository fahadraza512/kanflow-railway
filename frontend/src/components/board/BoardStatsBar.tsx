import { RefreshCw } from "lucide-react";
import { Task } from "@/lib/storage";

interface BoardStatsBarProps {
    tasks: Task[];
    lastSync: Date;
    onRefresh: () => void;
}

export default function BoardStatsBar({ tasks, lastSync, onRefresh }: BoardStatsBarProps) {
    const totalTasks = tasks.length;
    const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const urgentPriorityTasks = tasks.filter(t => t.priority === 'urgent').length;

    return (
        <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <StatItem color="bg-blue-500" label={`${totalTasks} Tasks`} />
                <StatItem color="bg-blue-400" label={`${lowPriorityTasks} Low`} />
                <StatItem color="bg-yellow-500" label={`${mediumPriorityTasks} Med`} />
                <StatItem color="bg-orange-500" label={`${highPriorityTasks} High`} />
                <StatItem color="bg-red-500" label={`${urgentPriorityTasks} Urgent`} />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                    Last sync: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>
        </div>
    );
}

function StatItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
            <span className="font-medium text-gray-700">{label}</span>
        </div>
    );
}
