import { useActivity } from "@/hooks/useActivity";
import { ActivityItem } from "./ActivityItem";
import { Activity as ActivityIcon, RefreshCw } from "lucide-react";
import { ActivityFeedSkeleton } from "../ui/LoadingSkeleton";

interface ActivityFeedProps {
  projectId?: string | number;
  taskId?: string | number;
  limit?: number;
  showFilters?: boolean;
}

export function ActivityFeed({
  projectId,
  taskId,
  limit = 50,
  showFilters = false,
}: ActivityFeedProps) {
  const { activities, loading, refresh } = useActivity({
    projectId,
    taskId,
    limit,
  });

  if (loading) {
    return (
      <div className="py-4">
        <ActivityFeedSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Activity</h3>
        </div>
        <button
          onClick={refresh}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Refresh activity"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ActivityIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No activity yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
