import { ChevronDown } from "lucide-react";

interface WorkspaceSwitcherProps {
    workspaceName: string;
}

export function WorkspaceSwitcher({ workspaceName }: WorkspaceSwitcherProps) {
    return (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
            <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600">
                {workspaceName.charAt(0)}
            </div>
            <span className="text-xs font-bold text-gray-900 truncate max-w-[100px]">
                {workspaceName}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
    );
}
