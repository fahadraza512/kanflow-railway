import { BarChart3, Download } from "lucide-react";
import { clsx } from "clsx";

interface AnalyticsHeaderProps {
    timeRange: "7d" | "30d" | "90d";
    onTimeRangeChange: (range: "7d" | "30d" | "90d") => void;
    onExport: () => void;
}

export default function AnalyticsHeader({
    timeRange,
    onTimeRangeChange,
    onExport
}: AnalyticsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
                <h1 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Analytics Dashboard
                </h1>
                <p className="text-gray-400 font-bold mt-1 uppercase text-[9px] tracking-widest">
                    Track performance and insights
                </p>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-lg border border-gray-200 shadow-sm">
                    {(["7d", "30d", "90d"] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => onTimeRangeChange(range)}
                            className={clsx(
                                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all",
                                timeRange === range
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-400 hover:bg-gray-50"
                            )}
                        >
                            {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onExport}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export
                </button>
            </div>
        </div>
    );
}
