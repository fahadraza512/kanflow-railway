import { Rocket } from "lucide-react";

interface UpgradeButtonProps {
    onClick: () => void;
    subscriptionStatus?: "active" | "cancelled" | "expired";
}

export function UpgradeButton({ onClick, subscriptionStatus }: UpgradeButtonProps) {
    const buttonText = subscriptionStatus === "cancelled" || subscriptionStatus === "expired" 
        ? "Reactivate" 
        : "Upgrade";

    return (
        <div
            onClick={onClick}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
        >
            <Rocket className="w-3 h-3" />
            {buttonText}
        </div>
    );
}
