import { SubscriptionEvent } from "@/lib/storage";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

interface SubscriptionActivityProps {
    events: SubscriptionEvent[];
}

export default function SubscriptionActivity({ events }: SubscriptionActivityProps) {
    const getEventIcon = (eventType: string) => {
        const icons = {
            upgraded: "🚀",
            reactivated: "✅",
            cancelled: "❌",
            expired: "⏰"
        };
        return icons[eventType as keyof typeof icons] || "📝";
    };

    const getEventColor = (eventType: string) => {
        const colors = {
            upgraded: "text-green-600 bg-green-50",
            reactivated: "text-green-600 bg-green-50",
            cancelled: "text-red-600 bg-red-50",
            expired: "text-gray-600 bg-gray-50"
        };
        return colors[eventType as keyof typeof colors] || "text-blue-600 bg-blue-50";
    };

    const getEventText = (event: SubscriptionEvent) => {
        const texts = {
            upgraded: `Upgraded to Pro (${event.billingCycle === "annual" ? "Annual" : "Monthly"})`,
            reactivated: `Reactivated Pro subscription (${event.billingCycle === "annual" ? "Annual" : "Monthly"})`,
            cancelled: "Cancelled Pro subscription",
            expired: "Subscription expired"
        };
        return texts[event.eventType as keyof typeof texts] || "Plan changed";
    };

    const sortedEvents = [...events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <Card>
            <CardHeader divider>
                <h2 className="text-sm font-bold text-gray-900">Subscription Activity</h2>
            </CardHeader>
            <CardBody>
                <div className="space-y-2">
                    {sortedEvents.map((event) => {
                        const eventDate = new Date(event.timestamp);
                        const eventIcon = getEventIcon(event.eventType);
                        const eventColor = getEventColor(event.eventType);
                        const eventText = getEventText(event);

                        return (
                            <div
                                key={event.id}
                                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
                            >
                                <div className={`w-6 h-6 rounded-full ${eventColor} flex items-center justify-center text-xs shrink-0`}>
                                    {eventIcon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-gray-900">{eventText}</p>
                                    <p className="text-[9px] text-gray-500 mt-0.5">
                                        {eventDate.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardBody>
        </Card>
    );
}
