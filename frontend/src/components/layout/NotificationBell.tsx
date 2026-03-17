import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Bell } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useUnreadNotificationsCount } from "@/hooks/api";
import { useNotificationStream } from "@/hooks/useNotificationStream";
import { NotificationPanel } from "./NotificationPanel";

function NotificationBell() {
  const { activeWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCountData } = useUnreadNotificationsCount(activeWorkspace?.id || null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Connect to SSE stream for real-time notifications
  useNotificationStream();

  const rawCount = typeof unreadCountData === 'number' ? unreadCountData : 0;

  // Animated badge state: display lags behind rawCount with exit→enter transition
  const [displayCount, setDisplayCount] = useState(rawCount);
  const [badgePhase, setBadgePhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const prevCountRef = useRef(rawCount);

  useEffect(() => {
    if (rawCount === prevCountRef.current) return;
    prevCountRef.current = rawCount;

    if (displayCount === 0 && rawCount > 0) {
      // Badge appearing for first time — skip exit, just enter
      setDisplayCount(rawCount);
      setBadgePhase('enter');
      const t = setTimeout(() => setBadgePhase('idle'), 150);
      return () => clearTimeout(t);
    }

    if (rawCount === 0) {
      // Badge disappearing — exit then hide
      setBadgePhase('exit');
      const t = setTimeout(() => {
        setDisplayCount(0);
        setBadgePhase('idle');
      }, 150);
      return () => clearTimeout(t);
    }

    // Number changing — exit, swap, enter
    setBadgePhase('exit');
    const t = setTimeout(() => {
      setDisplayCount(rawCount);
      setBadgePhase('enter');
      const t2 = setTimeout(() => setBadgePhase('idle'), 150);
      return () => clearTimeout(t2);
    }, 150);
    return () => clearTimeout(t);
  }, [rawCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => setIsOpen(false), []);
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
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const showBadge = displayCount > 0 || badgePhase === 'exit';

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
        aria-label={`Notifications${rawCount > 0 ? ` (${rawCount} unread)` : ''}`}
      >
        <Bell className={`
          w-5 h-5 transition-transform duration-200
          ${rawCount > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}
          ${isOpen ? 'scale-110' : 'group-hover:scale-110'}
        `} />

        {showBadge && (
          <span
            key={displayCount}
            className={`
              absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
              bg-gradient-to-br from-red-500 to-red-600 text-white text-[11px] font-bold
              rounded-full flex items-center justify-center shadow-lg shadow-red-500/50
              border-2 border-white
              ${badgePhase === 'exit' ? 'animate-badge-exit' : ''}
              ${badgePhase === 'enter' ? 'animate-badge-enter' : ''}
              ${badgePhase === 'idle' ? 'animate-pulse' : ''}
            `}
          >
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}

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
