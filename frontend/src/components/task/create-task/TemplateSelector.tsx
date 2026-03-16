import { FileText } from "lucide-react";
import { clsx } from "clsx";

interface Template {
    id: string | number;
    name: string;
}

interface TemplateSelectorProps {
    templates: Template[];
    selectedId: string | number | null;
    onSelect: (id: string | number) => void;
}

export function TemplateSelector({ templates, selectedId, onSelect }: TemplateSelectorProps) {
    if (templates.length === 0) return null;

    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <FileText className="w-3 h-3" />
                Use Template
            </label>
            <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        type="button"
                        onClick={() => onSelect(template.id)}
                        className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            selectedId === template.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                    >
                        {template.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
