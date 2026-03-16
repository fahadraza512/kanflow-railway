import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    color: "blue" | "purple" | "green" | "orange";
}

export default function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    color === "blue" && "bg-blue-100 text-blue-600",
                    color === "purple" && "bg-purple-100 text-purple-600",
                    color === "green" && "bg-green-100 text-green-600",
                    color === "orange" && "bg-orange-100 text-orange-600"
                )}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
                {value}
            </div>
            <div className="text-sm text-gray-500 font-medium">
                {label}
            </div>
        </div>
    );
}
