import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
    name: string;
    price: string;
    description: string;
    features: string[];
    popular: boolean;
}

interface PlanCardProps {
    plan: Plan;
    isSelected: boolean;
    isCreating: boolean;
    onSelect: () => void;
}

export default function PlanCard({ plan, isSelected, isCreating, onSelect }: PlanCardProps) {
    return (
        <div
            className={cn(
                "relative bg-white p-7 rounded-2xl border transition-all duration-300 flex flex-col hover:shadow-lg",
                plan.popular
                    ? "border-blue-600 shadow-xl scale-[1.02] z-10"
                    : "border-gray-100 hover:border-gray-200",
                isSelected && "ring-2 ring-blue-500"
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
                    <span className="text-4xl font-extrabold text-gray-900">
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
                onClick={onSelect}
                disabled={isCreating}
                className={cn(
                    "w-full py-3 px-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                    plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                )}
            >
                {isCreating ? "Creating..." : `Choose ${plan.name}`}
            </button>
        </div>
    );
}
