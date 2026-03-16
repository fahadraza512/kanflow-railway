import { Plus } from "lucide-react";

interface DashboardHeaderProps {
    userName: string;
    workspaceName: string;
    onCreateProject: () => void;
    canCreateProject?: boolean;
}

export default function DashboardHeader({
    userName,
    workspaceName,
    onCreateProject,
    canCreateProject = true
}: DashboardHeaderProps) {
    return (
        <div className="mb-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                <div>
                    <h1 className="text-base lg:text-lg font-bold tracking-tight text-gray-900 mb-0.5">
                        Welcome back, {userName}! 👋
                    </h1>
                    <p className="text-xs text-gray-500">
                        Here&apos;s what&apos;s happening in <span className="text-blue-600 font-semibold">{workspaceName}</span> today
                    </p>
                </div>
                {canCreateProject && (
                    <button
                        onClick={onCreateProject}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Project</span>
                    </button>
                )}
            </div>
        </div>
    );
}
