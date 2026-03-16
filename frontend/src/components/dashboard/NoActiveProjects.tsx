import { Archive, Plus } from "lucide-react";

interface NoActiveProjectsProps {
    archivedCount: number;
    onCreateProject: () => void;
    onShowArchived: () => void;
}

export default function NoActiveProjects({
    archivedCount,
    onCreateProject,
    onShowArchived
}: NoActiveProjectsProps) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Archive className="w-6 h-6 text-gray-400" />
                </div>

                <h2 className="text-base font-bold text-gray-900 mb-1">
                    No Active Projects
                </h2>
                <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
                    You have {archivedCount} archived project{archivedCount !== 1 ? 's' : ''}. Create a new project or restore an archived one.
                </p>

                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={onCreateProject}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create New Project</span>
                    </button>
                    <button
                        onClick={onShowArchived}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-xs"
                    >
                        <Archive className="w-3.5 h-3.5" />
                        <span>View Archived ({archivedCount})</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
