"use client";

import { clsx } from "clsx";

interface LabelTagProps {
    label: string;
}

export default function LabelTag({ label }: LabelTagProps) {
    const getLabelColor = (l: string) => {
        const lower = l.toLowerCase();
        if (lower.includes("bug")) return "bg-red-50 text-red-500 border-red-100";
        if (lower.includes("frontend")) return "bg-blue-50 text-blue-500 border-blue-100";
        if (lower.includes("backend")) return "bg-purple-50 text-purple-500 border-purple-100";
        if (lower.includes("design")) return "bg-pink-50 text-pink-500 border-pink-100";
        if (lower.includes("feature")) return "bg-green-50 text-green-500 border-green-100";
        if (lower.includes("urgent")) return "bg-orange-50 text-orange-500 border-orange-100";
        return "bg-gray-50 text-gray-400 border-gray-100";
    };

    return (
        <span className={clsx(
            "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
            getLabelColor(label)
        )}>
            {label}
        </span>
    );
}
