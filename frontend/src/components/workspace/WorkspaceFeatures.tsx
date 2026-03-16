import { Sparkles, Layout } from "lucide-react";

export default function WorkspaceFeatures() {
    return (
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xs mb-0.5">Free Forever</h3>
                <p className="text-[10px] text-gray-600">Start with our free plan, upgrade anytime</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center mb-1.5">
                    <Layout className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xs mb-0.5">Unlimited Projects</h3>
                <p className="text-[10px] text-gray-600">Create as many projects as you need</p>
            </div>
        </div>
    );
}
