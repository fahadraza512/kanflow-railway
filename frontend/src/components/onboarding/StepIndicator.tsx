import { Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    label: string;
    icon: LucideIcon;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="bg-white border-b border-gray-100">
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        
                        return (
                            <div key={idx} className="flex items-center flex-1">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                                            isCompleted
                                                ? "bg-green-500 text-white"
                                                : isCurrent
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                : "bg-gray-100 text-gray-400"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-sm font-medium hidden sm:block",
                                            isCurrent
                                                ? "text-gray-900"
                                                : isCompleted
                                                ? "text-green-600"
                                                : "text-gray-400"
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "flex-1 h-0.5 mx-4 rounded-full transition-all",
                                            isCompleted ? "bg-green-500" : "bg-gray-200"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
