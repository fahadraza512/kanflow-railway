import { Bell, Check } from "lucide-react";
import { clsx } from "clsx";
import { useCallback } from "react";

interface NotificationPreferencesProps {
    preferences: {
        assignments: boolean;
        mentions: boolean;
        comments: boolean;
        deadlines: boolean;
        paymentAlerts: boolean;
    };
    onPreferenceChange: (key: string, value: boolean) => void;
    isOwner?: boolean; // Only owners can see payment alerts
}

const preferenceOptions = [
    { key: "assignments" as const, label: "Task Assignment", description: "Get notified when you're assigned to a task" },
    { key: "mentions" as const, label: "Mentions", description: "Get notified when someone @mentions you in a comment" },
    { key: "comments" as const, label: "New Comments", description: "Get notified about new comments on tasks you're watching" },
    { key: "deadlines" as const, label: "Due Date Reminders", description: "Get reminded 24 hours before a task is due" },
    { key: "paymentAlerts" as const, label: "Payment Alerts", description: "Get notified about payment failures or billing issues" }
];

export default function NotificationPreferences({ preferences, onPreferenceChange, isOwner = false }: NotificationPreferencesProps) {
    const handleToggle = useCallback((key: string) => {
        return (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const currentValue = preferences[key as keyof typeof preferences];
            onPreferenceChange(key, !currentValue);
        };
    }, [onPreferenceChange, preferences]);
    
    // Filter options based on user role - only owners see payment alerts
    const visibleOptions = preferenceOptions.filter(option => {
        if (option.key === 'paymentAlerts') {
            return isOwner;
        }
        return true;
    });

    return (
        <div className="mb-4 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-600" />
                    Notification Preferences
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Choose which notifications you want to receive</p>
            </div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                {visibleOptions.map((pref) => (
                    <div key={pref.key} className="flex items-start sm:items-center gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">{pref.label}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 pr-2">{pref.description}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggle(pref.key)}
                            onMouseDown={(e) => e.preventDefault()}
                            className={clsx(
                                "relative w-11 h-6 sm:w-12 sm:h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0",
                                preferences[pref.key] ? "bg-blue-600" : "bg-gray-300"
                            )}
                            role="switch"
                            aria-checked={preferences[pref.key]}
                            aria-label={`Toggle ${pref.label}`}
                        >
                            <div className={clsx(
                                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center",
                                preferences[pref.key] ? "translate-x-5 sm:translate-x-6" : "translate-x-0.5"
                            )}>
                                {preferences[pref.key] && <Check className="w-3 h-3 text-blue-600" />}
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
