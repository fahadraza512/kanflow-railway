import { Calendar, Zap } from "lucide-react";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

interface SubscriptionStatusProps {
    currentPlan: "free" | "pro";
    subscriptionStatus?: "active" | "cancelled" | "expired";
    subscriptionEndDate?: string;
    billingCycle?: "annual" | "monthly";
    workspaceName: string;
    onUpgrade: () => void;
    onReactivate: () => void;
    onCancel: () => void;
}

export default function SubscriptionStatus({
    currentPlan,
    subscriptionStatus,
    subscriptionEndDate,
    billingCycle,
    workspaceName,
    onUpgrade,
    onReactivate,
    onCancel
}: SubscriptionStatusProps) {
    const getStatusBadge = () => {
        if (currentPlan === "free") return null;

        const variants = {
            active: "success" as const,
            cancelled: "danger" as const,
            expired: "default" as const
        };

        return (
            <Badge variant={variants[subscriptionStatus || "active"]}>
                {subscriptionStatus}
            </Badge>
        );
    };

    const getDescription = () => {
        if (currentPlan === "free") {
            return "You're on the free plan. Upgrade to unlock more features.";
        }

        if (subscriptionStatus === "cancelled") {
            return "Your subscription has been cancelled. You still have access until the end of your billing period.";
        }

        return "You're on the Pro plan. Enjoy unlimited access!";
    };

    return (
        <Card variant="bordered">
            <CardBody>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 w-full">
                        {workspaceName && (
                            <div className="mb-3 pb-3 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Workspace</p>
                                <p className="text-sm font-bold text-gray-900 break-words">{workspaceName}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h2 className="text-base font-bold text-gray-900">
                                Current Plan: {currentPlan === "free" ? "Free" : "Pro"}
                            </h2>
                            {getStatusBadge()}
                        </div>

                        <p className="text-xs text-gray-500 mb-3">
                            {getDescription()}
                        </p>

                        {subscriptionEndDate && currentPlan === "pro" && (
                            <div className="flex items-start gap-2 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                <span className="text-gray-600">
                                    {subscriptionStatus === "cancelled" ? "Access until" : "Renews on"}{" "}
                                    <span className="font-semibold text-gray-900">
                                        {new Date(subscriptionEndDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    {billingCycle && subscriptionStatus === "active" && (
                                        <span className="text-gray-500 ml-1">
                                            ({billingCycle === "annual" ? "Annual" : "Monthly"})
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {currentPlan === "free" ? (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={onUpgrade}
                                className="w-full md:w-auto"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Upgrade to Pro
                            </Button>
                        ) : subscriptionStatus === "cancelled" ? (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={onReactivate}
                                className="w-full md:w-auto"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Reactivate Subscription
                            </Button>
                        ) : (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={onCancel}
                                className="w-full md:w-auto"
                            >
                                Cancel Subscription
                            </Button>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
