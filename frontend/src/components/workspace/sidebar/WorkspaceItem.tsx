import { Workspace } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface WorkspaceItemProps {
  workspace: Workspace;
  isActive: boolean;
  onClick: () => void;
}

export function WorkspaceItem({ workspace, isActive, onClick }: WorkspaceItemProps) {
  const isPro = workspace.plan === "pro" && workspace.subscriptionStatus === "active";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-[10px] overflow-hidden",
        isActive
          ? "bg-white/20 text-white"
          : "bg-blue-600 text-white"
      )}>
        {workspace.icon ? (
          <img 
            src={workspace.icon} 
            alt={workspace.name}
            className="w-full h-full object-cover"
          />
        ) : (
          workspace.name.charAt(0)
        )}
      </div>
      <span className="text-xs font-semibold truncate flex-1 text-left">
        {workspace.name}
      </span>
      {isPro && (
        <span className={cn(
          "px-1.5 py-0.5 text-[9px] font-bold uppercase rounded tracking-wide",
          isActive
            ? "bg-white/20 text-white"
            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        )}>
          Pro
        </span>
      )}
    </button>
  );
}
