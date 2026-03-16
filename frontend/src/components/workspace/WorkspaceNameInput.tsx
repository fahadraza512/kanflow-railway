interface WorkspaceNameInputProps {
    value: string;
    error: string;
    onChange: (value: string) => void;
}

export default function WorkspaceNameInput({ value, error, onChange }: WorkspaceNameInputProps) {
    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Workspace Name <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                required
                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 font-medium text-sm ${
                    error 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="e.g., Acme Corporation"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus
            />
            {error ? (
                <p className="mt-1 text-xs text-red-600 font-medium">
                    {error}
                </p>
            ) : (
                <p className="mt-1 text-xs text-gray-500">
                    This will be the name of your new workspace
                </p>
            )}
        </div>
    );
}
