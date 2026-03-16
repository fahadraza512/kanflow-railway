import { Archive } from "lucide-react";

interface ArchivedHeaderProps {
    projects: { id: string | number; name: string }[];
    filterProject: string;
    onFilterChange: (value: string) => void;
}

export default function ArchivedHeader({ projects, filterProject, onFilterChange }: ArchivedHeaderProps) {
    // Filter out projects with invalid IDs
    const validProjects = projects.filter(project => project && project.id != null);
    
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
                <h1 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-gray-600" />
                    Archived Tasks
                </h1>
                <p className="text-gray-500 text-xs mt-0.5">
                    View and restore archived tasks
                </p>
            </div>

            {validProjects.length > 0 && (
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-700">Filter:</label>
                    <select
                        value={filterProject}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Projects</option>
                        {validProjects.map(project => (
                            <option key={project.id} value={project.id.toString()}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
