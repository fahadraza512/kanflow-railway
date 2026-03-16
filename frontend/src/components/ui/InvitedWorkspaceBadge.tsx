'use client';

/**
 * Animated badge for invited workspaces
 * Shows a pulsing green dot to indicate the workspace was joined via invitation
 */
export function InvitedWorkspaceBadge() {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer pulse animation */}
      <span className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75 animate-ping" />
      
      {/* Middle pulse animation - slower */}
      <span 
        className="absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-50"
        style={{
          animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />
      
      {/* Inner solid dot */}
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
    </div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function InvitedWorkspaceBadgeCompact() {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer pulse animation */}
      <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-75 animate-ping" />
      
      {/* Inner solid dot */}
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
    </div>
  );
}
