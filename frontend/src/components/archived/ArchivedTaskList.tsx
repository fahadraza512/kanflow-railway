import { Task } from "@/lib/storage";
import ArchivedTaskItem from "./ArchivedTaskItem";
import EmptyArchivedState from "./EmptyArchivedState";

interface ArchivedTaskListProps {
    tasks: Task[];
    filterProject: string;
    onRestore: (taskId: string | number) => void;
    onDelete: (taskId: string | number, taskTitle: string) => void;
    onTaskClick: (task: Task) => void;
}

export default function ArchivedTaskList({ tasks, filterProject, onRestore, onDelete, onTaskClick }: ArchivedTaskListProps) {
    if (tasks.length === 0) {
        return <EmptyArchivedState filterProject={filterProject} />;
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
                {tasks.map((task) => (
                    <ArchivedTaskItem
                        key={task.id}
                        task={task}
                        onRestore={onRestore}
                        onDelete={onDelete}
                        onTaskClick={onTaskClick}
                    />
                ))}
            </div>
        </div>
    );
}
