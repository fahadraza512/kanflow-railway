import { X, Layout } from "lucide-react";

interface ProjectModalHeaderProps {
    workspaceName: string;
    onClose: () => void;
}

export default function ProjectModalHeader({ workspaceName, onClose }: ProjectModalHeaderProps) {
    return (
        <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Create New Project</h3>
                    {workspaceName && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                            <Layout className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-semibold text-blue-900">
                                Workspace: <span className="text-blue-600">{workspaceName}</span>
                            </span>
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Fill in the details to set up your new project</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>
    );
}
