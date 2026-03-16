import { X, Sparkles, Building2 } from "lucide-react";

interface FormHeaderProps {
    workspaceName: string;
    onClose: () => void;
}

export function FormHeader({ workspaceName, onClose }: FormHeaderProps) {
    return (
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-4 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base font-bold">Contact Sales</h3>
                    </div>
                    <p className="text-xs text-gray-300">Get custom Enterprise pricing for your team</p>
                    {workspaceName && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                            <Building2 className="w-3 h-3 text-blue-300" />
                            <span className="text-xs font-medium text-white">{workspaceName}</span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
