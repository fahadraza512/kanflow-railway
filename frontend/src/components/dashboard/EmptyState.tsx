import { Rocket, Layout, Target, Zap, Sparkles } from "lucide-react";

interface EmptyStateProps {
    onCreateProject: () => void;
    canCreateProject?: boolean;
}

export default function EmptyState({ onCreateProject, canCreateProject = true }: EmptyStateProps) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Rocket className="w-6 h-6 text-white" />
                </div>

                <h2 className="text-base font-bold text-gray-900 mb-1">
                    {canCreateProject ? "Let's get started!" : "No projects yet"}
                </h2>
                <p className="text-xs text-gray-500 mb-4 max-w-md mx-auto">
                    {canCreateProject 
                        ? "Create your first project to start organizing tasks and collaborating with your team."
                        : "You haven't been assigned to any projects yet. Contact your workspace admin to get started."}
                </p>

                {canCreateProject && (
                    <>
                        <div className="grid sm:grid-cols-3 gap-3 mb-4 max-w-xl mx-auto">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-2 mx-auto">
                                    <Layout className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-xs">Visualize Work</h3>
                                <p className="text-xs text-gray-600">Track progress with Kanban boards.</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mb-2 mx-auto">
                                    <Target className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-xs">Organize Tasks</h3>
                                <p className="text-xs text-gray-600">Break down projects.</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-2 mx-auto">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-xs">Collaborate</h3>
                                <p className="text-xs text-gray-600">Work together seamlessly.</p>
                            </div>
                        </div>

                        <button
                            onClick={onCreateProject}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-xs"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Create your first project</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
