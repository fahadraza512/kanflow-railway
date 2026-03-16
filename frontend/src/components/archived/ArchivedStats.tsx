import { Archive } from "lucide-react";

interface ArchivedStatsProps {
    totalArchived: number;
    filteredCount: number;
    projectsCount: number;
}

export default function ArchivedStats({ totalArchived, filteredCount, projectsCount }: ArchivedStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Total Archived</span>
                    <Archive className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-xl font-bold text-gray-900">{totalArchived}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Filtered View</span>
                    <Archive className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-gray-900">{filteredCount}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Projects</span>
                    <Archive className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-gray-900">{projectsCount}</div>
            </div>
        </div>
    );
}
