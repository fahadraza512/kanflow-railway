import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Bell } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUnreadNotificationsCount } from "@/hooks/api";
import { useNotificationStream } from "@/hooks/useNotificationStream";
import { NotificationPanel } from "./NotificationPanel";

function NotificationBell() {
  const { activeWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCountData, isLoading, error } = useUnreadNotificationsCount(activeWorkspace?.id || null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Connect to SSE stream for real-time notifications
  useNotificationStream();

  // Ensure unreadCount is always a number
  const unreadCount = typeof unreadCountData === 'number' ? unreadCountData : 0;

  // Debug logging
  console.log('[NotificationBell] Render:', {
    activeWorkspaceId: activeWorkspace?.id,
    unreadCountData,
    unreadCount,
    isLoading,
    error,
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`
          relative p-2.5 rounded-xl transition-all duration-200 group
          ${isOpen 
            ? 'bg-blue-50 text-blue-600 shadow-sm' 
            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
          }
        `}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className={`
          w-5 h-5 transition-transform duration-200
          ${unreadCount > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}
          ${isOpen ? 'scale-110' : 'group-hover:scale-110'}
        `} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        
        {/* Active indicator dot */}
        {isOpen && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div ref={panelRef} className="absolute right-0 top-full">
          <NotificationPanel onClose={handleClose} />
        </div>
      )}
    </div>
  );
}

export default memo(NotificationBell);