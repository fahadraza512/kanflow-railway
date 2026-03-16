import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface PlanSelectionProps {
    billingCycle: "annual" | "monthly";
    onBillingCycleChange: (cycle: "annual" | "monthly") => void;
    onContinue: () => void;
}

export default function PlanSelection({
    billingCycle,
    onBillingCycleChange,
    onContinue
}: PlanSelectionProps) {
    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-1">Select a billing cycle</h3>
                <p className="text-gray-500 text-xs">Save 20% with annual billing</p>
            </div>

            <div className="space-y-3 flex-1">
                <div 
                    onClick={() => onBillingCycleChange("annual")}
                    className={clsx(
                        "p-3 rounded-lg border-2 relative cursor-pointer transition-all",
                        billingCycle === "annual" 
                            ? "border-blue-600 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                    )}
                >
                    {billingCycle === "annual" && (
                        <div className="absolute -top-1.5 right-3 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Best Value
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Annual</h4>
                            <p className="text-xs text-gray-600">$120 / year ($10/mo)</p>
                        </div>
                        <div className={clsx(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            billingCycle === "annual" ? "border-blue-600" : "border-gray-200"
                        )}>
                            {billingCycle === "annual" && (
                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                            )}
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => onBillingCycleChange("monthly")}
                    className={clsx(
                        "p-3 rounded-lg border-2 cursor-pointer transition-all",
                        billingCycle === "monthly" 
                            ? "border-blue-600 bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                    )}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">Monthly</h4>
                            <p className="text-xs text-gray-600">$12 / month</p>
                        </div>
                        <div className={clsx(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            billingCycle === "monthly" ? "border-blue-600" : "border-gray-200"
                        )}>
                            {billingCycle === "monthly" && (
                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onContinue}
                className="w-full mt-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
                Continue to Checkout
                <ChevronRight className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
