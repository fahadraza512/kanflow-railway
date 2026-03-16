"use client";

import { clsx } from "clsx";
import { Priority } from "@/types/kanban";

interface PriorityBadgeProps {
    priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
    const getPriorityColor = (p: string) => {
        switch (p) {
            case "urgent": return "bg-red-50 text-red-600 border-red-100";
            case "high": return "bg-orange-50 text-orange-600 border-orange-100";
            case "medium": return "bg-yellow-50 text-yellow-600 border-yellow-100";
            case "low": return "bg-green-50 text-green-600 border-green-100";
            default: return "bg-gray-50 text-gray-400 border-gray-100";
        }
    };

    return (
        <span className={clsx(
            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm border",
            getPriorityColor(priority)
        )}>
            {priority}
        </span>
    );
}
