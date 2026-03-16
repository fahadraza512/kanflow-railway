import { ActivityLog } from "@/types/kanban";

interface TaskActivityProps {
    activity: ActivityLog[];
}

export default function TaskActivity({ activity }: TaskActivityProps) {
    const getRelativeTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'just now';
            if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            if (diffDays === 1) return 'yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            return date.toLocaleDateString();
        } catch (error) {
            return 'recently';
        }
    };

    // Ensure activity is always an array
    const safeActivity = Array.isArray(activity) ? activity : [];

    return (
        <div className="space-y-1.5">
            {safeActivity.map((log) => (
                <div key={log.id} className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-lg bg-gray-100 flex items-center justify-center text-[8px] font-semibold text-gray-600 uppercase shrink-0">
                        {log.userName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                    </div>
                    <div className="flex-1 space-y-0.5">
                        <p className="text-[9px] text-gray-600">
                            <span className="font-semibold text-gray-900">{log.userName || 'Unknown'}</span>
                            <span className="mx-1 text-gray-500">{log.action === 'created' ? 'created this task' : log.detail || 'updated this task'}</span>
                        </p>
                        <p className="text-[8px] text-gray-400">
                            {getRelativeTime(log.createdAt)}
                        </p>
                    </div>
                </div>
            ))}
            {safeActivity.length === 0 && (
                <p className="text-[9px] text-gray-400 italic text-center py-1">No recent activity</p>
            )}
        </div>
    );
}
