interface ProjectNameInputProps {
    value: string;
    error: string;
    onChange: (value: string) => void;
}

export default function ProjectNameInput({ value, error, onChange }: ProjectNameInputProps) {
    return (
        <div>
            <label className="block text-gray-900 font-semibold mb-1.5 text-xs">
                Project Name <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                required
                placeholder="e.g. Q1 Marketing Campaign"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-xs text-gray-900 placeholder-gray-400 ${
                    error 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                }`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
            />
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
