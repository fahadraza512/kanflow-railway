import { clsx } from "clsx";

interface TaskDescriptionProps {
    description: string | undefined;
    readOnly?: boolean;
    onChange: (description: string) => void;
    onBlur: () => void;
}

export default function TaskDescription({
    description,
    readOnly,
    onChange,
    onBlur
}: TaskDescriptionProps) {
    return (
        <div className="space-y-0.5">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">Description</label>
            <textarea
                className={clsx(
                    "w-full p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[9px] focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none transition-colors placeholder:text-gray-400",
                    !readOnly ? "focus:border-blue-500" : ""
                )}
                placeholder="Add a more detailed description..."
                value={description || ""}
                readOnly={readOnly}
                onChange={(e) => !readOnly && onChange(e.target.value)}
                onBlur={onBlur}
            />
        </div>
    );
}
