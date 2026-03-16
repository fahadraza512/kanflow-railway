import { Layout, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface Plan {
    name: string;
    price: string;
    description: string;
    features: string[];
    popular: boolean;
}

interface PlanSelectionStepProps {
    workspaceName: string;
    selectedPlan: string | null;
    isCreatingWorkspace: boolean;
    plans: Plan[];
    onSelectPlan: (planName: string) => void;
    onBack: () => void;
}

export default function PlanSelectionStep({
    workspaceName,
    selectedPlan,
    isCreatingWorkspace,
    plans,
    onSelectPlan,
    onBack
}: PlanSelectionStepProps) {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6 sm:mb-10">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    Choose your Plan
                </h2>
                {workspaceName && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <Layout className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-blue-900">
                            Workspace: <span className="text-blue-600">{workspaceName}</span>
                        </span>
                    </div>
                )}
                <p className="mt-2 text-xs sm:text-sm text-gray-500 px-2">
                    Select the best plan for your team. You can always change later.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {plans.map((plan, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "relative bg-white p-6 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col",
                            plan.popular
                                ? "border-blue-600 shadow-xl scale-[1.02] z-10"
                                : "border-gray-100 hover:border-gray-200",
                            selectedPlan === plan.name && "ring-2 ring-blue-500"
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                                Most Popular
                            </div>
                        )}
                        <div className="mb-6">
                            <span className="text-lg font-bold text-gray-900">
                                {plan.name}
                            </span>
                            <div className="mt-4 flex items-baseline gap-1">
                                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                                    {plan.price === "Custom" ? "" : "$"}
                                    {plan.price}
                                </span>
                                {plan.price !== "Custom" && (
                                    <span className="text-gray-500 text-sm">/month</span>
                                )}
                            </div>
                            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                                {plan.description}
                            </p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-grow">
                            {plan.features.map((feature, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2.5 text-sm text-gray-600"
                                >
                                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => onSelectPlan(plan.name)}
                            disabled={isCreatingWorkspace}
                            className={cn(
                                "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                plan.popular
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                    : "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            )}
                        >
                            Select {plan.name}
                        </button>
                    </div>
                ))}
            </div>

            <Button
                onClick={onBack}
                variant="outline"
                fullWidth
                className="mt-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workspace
            </Button>
        </div>
    );
}
