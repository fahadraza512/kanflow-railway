import { Activity } from "@/types/activity";
import {
  CheckCircle2,
  MessageCircle,
  UserPlus,
  Tag,
  ListChecks,
  AlertCircle,
  Calendar,
  FileText,
  Upload,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItemProps {
  activity: Activity;
}

const activityIcons: Record<string, React.ReactNode> = {
  task_created: <FileText className="w-4 h-4" />,
  task_completed: <CheckCircle2 className="w-4 h-4" />,
  task_assigned: <UserPlus className="w-4 h-4" />,
  comment_added: <MessageCircle className="w-4 h-4" />,
  label_added: <Tag className="w-4 h-4" />,
  label_removed: <Tag className="w-4 h-4" />,
  subtask_completed: <ListChecks className="w-4 h-4" />,
  subtask_added: <ListChecks className="w-4 h-4" />,
  priority_changed: <AlertCircle className="w-4 h-4" />,
  due_date_changed: <Calendar className="w-4 h-4" />,
  file_uploaded: <Upload className="w-4 h-4" />,
};

const activityColors: Record<string, string> = {
  task_created: "bg-blue-100 text-blue-600",
  task_completed: "bg-green-100 text-green-600",
  task_assigned: "bg-purple-100 text-purple-600",
  comment_added: "bg-yellow-100 text-yellow-600",
  label_added: "bg-pink-100 text-pink-600",
  label_removed: "bg-gray-100 text-gray-600",
  subtask_completed: "bg-teal-100 text-teal-600",
  subtask_added: "bg-cyan-100 text-cyan-600",
  priority_changed: "bg-orange-100 text-orange-600",
  due_date_changed: "bg-indigo-100 text-indigo-600",
  file_uploaded: "bg-emerald-100 text-emerald-600",
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const icon = activityIcons[activity.type] || <FileText className="w-4 h-4" />;
  const colorClass = activityColors[activity.type] || "bg-gray-100 text-gray-600";

  return (
    <div className="flex gap-3 py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{activity.userName}</span>{" "}
          <span className="text-gray-600">{activity.description}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
