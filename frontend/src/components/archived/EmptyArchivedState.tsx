import { Archive } from "lucide-react";

interface EmptyArchivedStateProps {
    filterProject: string;
}

export default function EmptyArchivedState({ filterProject }: EmptyArchivedStateProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="py-16 text-center">
                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-3 border border-gray-200">
                    <Archive className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Archived Tasks</h3>
                <p className="text-gray-500 text-xs">
                    {filterProject === "all" 
                        ? "You haven't archived any tasks yet"
                        : "No archived tasks in this project"}
                </p>
            </div>
        </div>
    );
}
