import { useMemo } from "react";
import { Task } from "@/lib/storage";

export function useTaskFilter(tasks: Task[], searchTerm: string) {
    const filteredTasks = useMemo(() => {
        if (!searchTerm) return tasks;
        
        const lowerSearch = searchTerm.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(lowerSearch) ||
            task.description?.toLowerCase().includes(lowerSearch)
        );
    }, [tasks, searchTerm]);

    return filteredTasks;
}
