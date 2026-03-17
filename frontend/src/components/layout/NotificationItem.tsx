import { Notification } from "@/types/api.types";
import { useMarkNotificationAsRead } from "@/hooks/api";
import { useDeleteNotification } from "@/hooks/api";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { 
  CheckCircle2, 
  MessageCircle, 
  UserPlus, 
  Calendar, 
  X, 
  UserMinus,
  ArrowRightLeft,
  Clock,
  Trash2,
  Move,
  MessageSquare,
  AtSign,
  Reply,
  LayoutGrid,
  UserX,
  Mail,
  Shield,
  Users,
  CreditCard,
  AlertCircle,
  DollarSign
} from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
  workspaceName?: string;
  showWorkspace?: boolean;
}

const notificationIcons: Record<string, React.ReactNode> = {
  // Task notifications
  task_assigned: <UserPlus className="w-4 h-4" />,
  task_unassigned: <UserMinus className="w-4 h-4" />,
  task_status_changed: <ArrowRightLeft className="w-4 h-4" />,
  task_due_soon: <Clock className="w-4 h-4" />,
  task_deleted: <Trash2 className="w-4 h-4" />,
  task_moved: <Move className="w-4 h-4" />,
  
  // Comment notifications
  task_commented: <MessageSquare className="w-4 h-4" />,
  comment_mention: <AtSign className="w-4 h-4" />,
  comment_reply: <Reply className="w-4 h-4" />,
  
  // Board notifications
  board_member_added: <LayoutGrid className="w-4 h-4" />,
  board_member_removed: <UserX className="w-4 h-4" />,
  board_created: <LayoutGrid className="w-4 h-4" />,
  
  // Workspace notifications
  workspace_invite: <Mail className="w-4 h-4" />,
  workspace_role_changed: <Shield className="w-4 h-4" />,
  workspace_member_joined: <Users className="w-4 h-4" />,
  
  // Payment alert notifications (owner only)
  payment_failed: <AlertCircle className="w-4 h-4" />,
  payment_succeeded: <CheckCircle2 className="w-4 h-4" />,
  subscription_expiring: <Clock className="w-4 h-4" />,
  subscription_expired: <AlertCircle className="w-4 h-4" />,
  subscription_renewed: <CreditCard className="w-4 h-4" />,
  invoice_payment_failed: <AlertCircle className="w-4 h-4" />,
  invoice_payment_succeeded: <DollarSign className="w-4 h-4" />,
  
  // Legacy/fallback
  assignment: <UserPlus className="w-4 h-4" />,
  mention: <AtSign className="w-4 h-4" />,
  deadline: <Clock className="w-4 h-4" />,
  comment: <MessageSquare className="w-4 h-4" />,
};

const notificationColors: Record<string, string> = {
  // Task notifications
  task_assigned: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600",
  task_unassigned: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600",
  task_status_changed: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600",
  task_due_soon: "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600",
  task_deleted: "bg-gradient-to-br from-red-100 to-red-200 text-red-600",
  task_moved: "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600",
  
  // Comment notifications
  task_commented: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600",
  comment_mention: "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600",
  comment_reply: "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-600",
  
  // Board notifications
  board_member_added: "bg-gradient-to-br from-green-100 to-green-200 text-green-600",
  board_member_removed: "bg-gradient-to-br from-red-100 to-red-200 text-red-600",
  board_created: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600",
  
  // Workspace notifications
  workspace_invite: "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600",
  workspace_role_changed: "bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600",
  workspace_member_joined: "bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600",
  
  // Payment alert notifications (owner only)
  payment_failed: "bg-gradient-to-br from-red-100 to-red-200 text-red-600",
  payment_succeeded: "bg-gradient-to-br from-green-100 to-green-200 text-green-600",
  subscription_expiring: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600",
  subscription_expired: "bg-gradient-to-br from-red-100 to-red-200 text-red-600",
  subscription_renewed: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600",
  invoice_payment_failed: "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600",
  invoice_payment_succeeded: "bg-gradient-to-br from-lime-100 to-lime-200 text-lime-600",
  
  // Legacy/fallback
  assignment: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600",
  mention: "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600",
  deadline: "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600",
  comment: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600",
};

export function NotificationItem({ notification, onClose, workspaceName, showWorkspace }: NotificationItemProps) {
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const router = useRouter();

  const icon = notificationIcons[notification.type] || <CheckCircle2 className="w-4 h-4" />;
  const colorClass = notificationColors[notification.type] || "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600";

  const handleClick = () => {
    // Optimistically mark as read in cache immediately (no wait for API)
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Get workspace ID from notification or use active workspace
    const workspaceId = notification.workspaceId;
    
    // Navigate based on notification type
    switch (notification.type) {
      // Task notifications - need to find the board/project to navigate properly
      case 'task_assigned':
      case 'task_unassigned':
      case 'task_status_changed':
      case 'task_due_soon':
      case 'task_deleted':
      case 'task_moved':
        if (notification.relatedEntityId && workspaceId) {
          // For now, navigate to dashboard and let user find the task
          // TODO: Store boardId and projectId in notification metadata for direct navigation
          router.push(`/dashboard?taskId=${notification.relatedEntityId}`);
        }
        break;
      
      // Comment notifications - navigate to task with comment
      case 'task_commented':
      case 'comment_mention':
      case 'comment_reply':
        if (notification.metadata?.taskId && workspaceId) {
          // Navigate to dashboard with task and comment highlighted
          router.push(`/dashboard?taskId=${notification.metadata.taskId}&commentId=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityId && workspaceId) {
          router.push(`/dashboard?commentId=${notification.relatedEntityId}`);
        }
        break;
      
      // Board notifications - navigate to board
      case 'board_member_added':
      case 'board_member_removed':
      case 'board_created':
        if (notification.relatedEntityId && workspaceId && notification.metadata?.projectId) {
          // Navigate directly to board if we have projectId
          router.push(`/workspaces/${workspaceId}/projects/${notification.metadata.projectId}/boards/${notification.relatedEntityId}`);
        } else if (workspaceId) {
          // Otherwise go to dashboard
          router.push(`/dashboard`);
        }
        break;
      
      // Workspace notifications
      case 'workspace_invite':
        // Navigate to invitation acceptance page
        if (notification.relatedEntityId) {
          router.push(`/invite/accept?token=${notification.relatedEntityId}`);
        }
        break;
      
      case 'workspace_role_changed':
      case 'workspace_member_joined':
        // Navigate to workspace settings/members
        if (workspaceId) {
          router.push(`/settings/members`);
        }
        break;
      
      // Payment alert notifications (owner only) - navigate to billing
      case 'payment_failed':
      case 'payment_succeeded':
      case 'subscription_expiring':
      case 'subscription_expired':
      case 'subscription_renewed':
      case 'invoice_payment_failed':
      case 'invoice_payment_succeeded':
        // Navigate to billing settings
        router.push(`/settings/billing`);
        break;
      
      // Fallback for legacy types
      default:
        if (notification.relatedEntityType === 'task' && notification.relatedEntityId) {
          router.push(`/dashboard?taskId=${notification.relatedEntityId}`);
        } else if (notification.relatedEntityType === 'board' && notification.relatedEntityId && workspaceId) {
          router.push(`/dashboard`);
        } else if (notification.relatedEntityType === 'comment' && notification.relatedEntityId) {
          router.push(`/dashboard?commentId=${notification.relatedEntityId}`);
        }
    }
    
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotificationMutation.mutateAsync(notification.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-2 sm:p-2.5 hover:bg-white transition-all duration-200 group relative ${
        !notification.isRead ? "bg-white" : "bg-gray-50/50"
      }`}
    >
      <div className="flex gap-2">
        {/* Icon */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {showWorkspace && workspaceName && (
            <p className="text-[9px] font-semibold text-blue-500 uppercase tracking-wide mb-0.5 truncate">
              {workspaceName}
            </p>
          )}
          <p className={`text-xs line-clamp-2 leading-tight ${!notification.isRead ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          <p 
            className="text-[10px] text-gray-500 mt-0.5" 
            title={format(new Date(notification.createdAt), 'PPpp')}
          >
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        
        {/* Delete button */}
        <div className="flex-shrink-0 flex items-start gap-1">
          <button
            onClick={handleDelete}
            disabled={deleteNotificationMutation.isPending}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all disabled:opacity-50"
            title="Delete notification"
          >
            <X className="w-3 h-3 text-red-600" />
          </button>
          
          {/* Unread indicator */}
          {!notification.isRead && (
            <div className="pt-0.5">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className="absolute bottom-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </button>
  );
}
