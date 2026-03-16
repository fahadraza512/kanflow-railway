const COVER_COLORS = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#A855F7" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Pink", value: "#EC4899" },
];

interface ProjectColorPickerProps {
    selectedColor: string;
    onColorChange: (color: string) => void;
}

export default function ProjectColorPicker({ selectedColor, onColorChange }: ProjectColorPickerProps) {
    return (
        <div>
            <label className="block text-gray-900 font-semibold mb-1.5 text-xs">Cover Color</label>
            <div className="flex gap-2">
                {COVER_COLORS.map((color) => (
                    <button
                        key={color.value}
                        type="button"
                        onClick={() => onColorChange(color.value)}
                        className={`w-8 h-8 rounded-md transition-all relative ${
                            selectedColor === color.value
                                ? "ring-2 ring-offset-1 ring-blue-500 scale-105"
                                : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    >
                        {selectedColor === color.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
