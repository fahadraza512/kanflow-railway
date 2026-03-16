import { Check } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export interface Plan {
    name: string;
    price: string;
    period: string;
    features: string[];
    current: boolean;
    popular?: boolean;
}

interface PlanCardProps {
    plan: Plan;
    onSelect: (planName: string) => void;
    disabled?: boolean;
}

export default function PlanCard({ plan, onSelect, disabled = false }: PlanCardProps) {
    return (
        <Card
            variant={plan.popular ? "elevated" : "default"}
            padding="lg"
            className={clsx(
                "relative transition-all hover:shadow-lg",
                plan.popular && "ring-2 ring-blue-500 scale-[1.02]",
                disabled && !plan.current && "opacity-60"
            )}
        >
            {plan.popular && (
                <Badge
                    variant="primary"
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                    Most Popular
                </Badge>
            )}

            {plan.current && (
                <Badge
                    variant="success"
                    className="absolute top-4 right-4"
                >
                    Current Plan
                </Badge>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                        <span className="text-sm text-gray-500">/{plan.period}</span>
                    )}
                </div>
            </div>

            <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                variant={plan.popular ? "primary" : "outline"}
                fullWidth
                onClick={() => onSelect(plan.name)}
                disabled={disabled || plan.current}
                className="font-bold"
            >
                {plan.current ? "Current Plan" : `Choose ${plan.name}`}
            </Button>
        </Card>
    );
}
