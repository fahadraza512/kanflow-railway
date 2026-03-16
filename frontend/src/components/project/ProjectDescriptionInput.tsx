interface ProjectDescriptionInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function ProjectDescriptionInput({ value, onChange }: ProjectDescriptionInputProps) {
    return (
        <div>
            <label className="block text-gray-900 font-semibold mb-1.5 text-xs">
                Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
                placeholder="What is this project about?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs text-gray-900 placeholder-gray-400 resize-none"
                rows={2}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
