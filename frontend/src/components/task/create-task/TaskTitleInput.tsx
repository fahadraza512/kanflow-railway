interface TaskTitleInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function TaskTitleInput({ value, onChange, error }: TaskTitleInputProps) {
    return (
        <div>
            <input
                type="text"
                required
                autoFocus
                placeholder="Task Title"
                className={`w-full px-0 py-1 border-none text-sm font-bold placeholder:text-gray-300 focus:ring-0 focus:outline-none ${
                    error ? "text-red-600" : ""
                }`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
