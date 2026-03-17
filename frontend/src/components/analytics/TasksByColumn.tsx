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

// Consistent color palette cycling for any number of columns
const COLORS = [
    { bar: "bg-slate-500",   text: "text-slate-600",   dot: "bg-slate-500" },
    { bar: "bg-blue-500",    text: "text-blue-600",    dot: "bg-blue-500" },
    { bar: "bg-purple-500",  text: "text-purple-600",  dot: "bg-purple-500" },
    { bar: "bg-green-500",   text: "text-green-600",   dot: "bg-green-500" },
    { bar: "bg-orange-400",  text: "text-orange-500",  dot: "bg-orange-400" },
    { bar: "bg-pink-500",    text: "text-pink-600",    dot: "bg-pink-500" },
    { bar: "bg-teal-500",    text: "text-teal-600",    dot: "bg-teal-500" },
    { bar: "bg-yellow-500",  text: "text-yellow-600",  dot: "bg-yellow-500" },
];

export default function TasksByColumn({ byColumn, totalTasks }: TasksByColumnProps) {
    if (!byColumn || byColumn.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Columns className="w-4 h-4 text-blue-600" />
                    Tasks by Column
                </h2>
                <p className="text-xs text-gray-400 text-center py-4">No column data available</p>
            </div>
        );
    }

    const max = Math.max(...byColumn.map(c => c.count), 1);

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Columns className="w-4 h-4 text-blue-600" />
                Tasks by Column
            </h2>

            <div className="space-y-2">
                {byColumn.map((col, i) => {
                    const color = COLORS[i % COLORS.length];
                    const pct = totalTasks > 0 ? (col.count / totalTasks) * 100 : 0;
                    const barPct = (col.count / max) * 100;

                    return (
                        <div key={col.listId}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
                                    {col.name}
                                </span>
                                <span className={`font-bold ${color.text}`}>
                                    {col.count} <span className="text-gray-400 font-normal">({pct.toFixed(0)}%)</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                                    style={{ width: `${barPct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mini summary row */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {byColumn.map((col, i) => {
                    const color = COLORS[i % COLORS.length];
                    return (
                        <span key={col.listId} className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                            {col.name}: {col.count}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
