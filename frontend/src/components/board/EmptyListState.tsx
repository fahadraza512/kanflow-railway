import { ListTodo } from "lucide-react";

interface EmptyListStateProps {
    listName: string;
}

export default function EmptyListState({ listName }: EmptyListStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ListTodo className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
                No tasks in {listName}
            </p>
        </div>
    );
}
