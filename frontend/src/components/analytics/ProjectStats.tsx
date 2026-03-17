import { Target } from "lucide-react";

interface ProjectStat {
    projectId: string | number;
    name: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
}

interface ProjectStatsProps {
    projectStats: ProjectStat[];
}

export default function ProjectStats({ projectStats }: ProjectStatsProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-600" />
                Active Projects Summary
            </h2>
            {projectStats.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-xs">No projects yet</p>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {projectStats.map((project) => (
                        <div key={project.projectId} className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-xs font-bold text-gray-900 mb-2 truncate">{project.name}</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-gray-600">Total Tasks</span>
                                    <span className="font-bold text-gray-900">{project.totalTasks}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                    <span className="text-gray-600">Completed</span>
                                    <span className="font-bold text-green-600">{project.completedTasks}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-1">
                                    <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: `${project.completionRate}%` }}
                                    />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-blue-600">{project.completionRate}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
