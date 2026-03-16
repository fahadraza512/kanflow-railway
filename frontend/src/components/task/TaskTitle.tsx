import { clsx } from "clsx";

interface TaskTitleProps {
    title: string;
    isEditing: boolean;
    readOnly?: boolean;
    onTitleChange: (title: string) => void;
    onStartEdit: () => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function TaskTitle({
    title,
    isEditing,
    readOnly,
    onTitleChange,
    onStartEdit,
    onBlur,
    onKeyDown
}: TaskTitleProps) {
    if (isEditing && !readOnly) {
        return (
            <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className="w-full text-sm font-bold text-gray-900 leading-tight border-2 border-blue-500 rounded-lg px-2 py-1 focus:outline-none"
            />
        );
    }

    return (
        <h2 
            className={clsx(
                "text-sm font-bold text-gray-900 leading-tight",
                !readOnly && "cursor-pointer hover:text-blue-600 transition-colors"
            )}
            onClick={() => !readOnly && onStartEdit()}
        >
            {title}
        </h2>
    );
}
