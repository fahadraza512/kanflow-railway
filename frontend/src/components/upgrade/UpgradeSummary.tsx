import { Rocket, Check } from "lucide-react";

interface UpgradeSummaryProps {
    workspaceName: string;
}

export default function UpgradeSummary({ workspaceName }: UpgradeSummaryProps) {
    const features = [
        "Unlimited Boards",
        "Custom Domains",
        "Priority Support"
    ];

    return (
        <div className="w-full sm:w-5/12 bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-5 text-white flex flex-col justify-between min-h-[200px] sm:min-h-0">
            <div>
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mb-2.5">
                    <Rocket className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm sm:text-base font-bold mb-1">Scale your team with Pro.</h2>
                {workspaceName && (
                    <div className="mb-2 px-2.5 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-md">
                        <p className="text-[9px] font-semibold text-blue-300 mb-0.5">Upgrading Workspace</p>
                        <p className="text-xs font-bold text-white truncate">{workspaceName}</p>
                    </div>
                )}
                <p className="text-gray-400 text-[11px] leading-relaxed">
                    Get unlimited boards, advanced analytics, and priority support.
                </p>
            </div>

            <div className="space-y-1.5 mt-4">
                {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-[11px] font-medium">
                        <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2 h-2 text-white" />
                        </div>
                        <span>{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
