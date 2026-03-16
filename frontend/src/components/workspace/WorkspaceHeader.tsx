import { Layout, ArrowLeft } from "lucide-react";

interface WorkspaceHeaderProps {
    onBack: () => void;
}

export default function WorkspaceHeader({ onBack }: WorkspaceHeaderProps) {
    return (
        <>
            <button
                onClick={onBack}
                className="mb-3 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Dashboard
            </button>

            <div className="text-center mb-4">
                <div className="relative inline-block mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Layout className="w-7 h-7 text-white" />
                    </div>
                </div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-1.5">
                    Create New Workspace
                </h1>
                <p className="text-sm text-gray-600">
                    Add another workspace to organize different teams or projects
                </p>
            </div>
        </>
    );
}
