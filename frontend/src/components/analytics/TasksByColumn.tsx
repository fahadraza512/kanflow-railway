import { Columns } from "lucide-react";

interface ColumnStat {
    listId: string;
    name: string;
    count: number;
    position?: number;
}

interface TasksByColumnProps {
    byColumn: ColumnStat[];
    totalTasks: number;
}

const COLORS = [
    { bar: "bg-slate-400",  light: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200" },
    { bar: "bg-blue-500",   light: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200" },
    { bar: "bg-violet-500", light: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
    { bar: "bg-emerald-500",light: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-200" },
    { bar: "bg-orange-400", light: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    { bar: "bg-pink-500",   light: "bg-pink-50",   text: "text-pink-600",   border: "border-pink-200" },
    { bar: "bg-teal-500",   light: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-200" },
    { bar: "bg-yellow-400", light: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
];

export default function TasksByColumn({ byColumn, totalTasks }: TasksByColumnProps) {
    if (!byColumn || byColumn.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Columns className="w-4 h-4 text-blue-600" />
                    Tasks by Column
                </h2>
                <p className="text-xs text-gray-400 text-center py-6">No column data available</p>
            </div>
        );
    }

    // Sort by count descending so biggest column is always on top
    const sorted = [...byColumn].sort((a, b) => b.count - a.count);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Columns className="w-4 h-4 text-blue-600" />
                    Tasks by Column
                </h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {totalTasks} total
                </span>
            </div>

            {/* Bars */}
            <div className="space-y-3">
                {sorted.map((col, i) => {
                    const color = COLORS[i % COLORS.length];
                    const pct = totalTasks > 0 ? (col.count / totalTasks) * 100 : 0;

                    return (
                        <div key={col.listId} className="group">
                            {/* Label row */}
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[60%]">
                                    {col.name}
                                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-900">
                                        {col.count} {col.count === 1 ? "task" : "tasks"}
                                    </span>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color.light} ${color.text}`}>
                                        {pct.toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {/* Bar track */}
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                                    style={{ width: `${Math.max(pct, col.count > 0 ? 2 : 0)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stacked proportion strip */}
            {totalTasks > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Distribution</p>
                    <div className="flex h-2 rounded-full overflow-hidden gap-px">
                        {sorted.map((col, i) => {
                            const color = COLORS[i % COLORS.length];
                            const pct = (col.count / totalTasks) * 100;
                            if (pct === 0) return null;
                            return (
                                <div
                                    key={col.listId}
                                    className={`${color.bar} transition-all duration-500`}
                                    style={{ width: `${pct}%` }}
                                    title={`${col.name}: ${col.count} (${pct.toFixed(0)}%)`}
                                />
                            );
                        })}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {sorted.map((col, i) => {
                            const color = COLORS[i % COLORS.length];
                            return (
                                <span key={col.listId} className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${color.bar}`} />
                                    {col.name}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
