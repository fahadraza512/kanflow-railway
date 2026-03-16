interface PlanLimitWarningProps {
    onUpgrade: () => void;
}

export default function PlanLimitWarning({ onUpgrade }: PlanLimitWarningProps) {
    return (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">⚠️</span>
            </div>
            <div className="flex-1">
                <p className="text-xs font-semibold text-orange-900">
                    Board limit reached
                </p>
                <p className="text-xs text-orange-700">
                    Upgrade to Pro for unlimited boards.
                </p>
            </div>
            <button
                onClick={onUpgrade}
                className="px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded-md hover:bg-orange-700 transition-colors"
            >
                Upgrade
            </button>
        </div>
    );
}
