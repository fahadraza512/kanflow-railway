import { CreditCard } from "lucide-react";

interface PlanHeaderProps {
    workspaceName?: string;
}

export default function PlanHeader({ workspaceName }: PlanHeaderProps) {
    return (
        <div className="text-center mb-10">
            <div className="relative inline-block mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-7 h-7 text-white" />
                </div>
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-1.5">
                Choose your Plan
            </h1>
            {workspaceName && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm font-semibold text-blue-900">
                        Workspace: <span className="text-blue-600">{workspaceName}</span>
                    </span>
                </div>
            )}
            <p className="mt-2 text-sm text-gray-600">
                Select the best plan for your team. You can always change later.
            </p>
        </div>
    );
}
