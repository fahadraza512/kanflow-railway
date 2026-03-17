import { Columns, FolderOpen, Layout } from "lucide-react";

interface ColumnStat {
    listId: string;
    name: string;
    count: number;
    position?: number;
    boardId?: string | null;
    boardName?: string;
    projectId?: string | null;
    projectName?: string;
}

interface TasksByColumnProps {
    byColumn: ColumnStat[];
    totalTasks: number;
}

const COLUMN_COLORS = [
    { bar: "bg-slate-400",   light: "bg-slate-50",   text: "text-slate-600" },
    { bar: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-600" },
    { bar: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-600" },
    { bar: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
    { bar: "bg-orange-400",  light: "bg-orange-50",  text: "text-orange-600" },
    { bar: "bg-pink-500",    light: "bg-pink-50",    text: "text-pink-600" },
    { bar: "bg-teal-500",    light: "bg-teal-50",    text: "text-teal-600" },
    { bar: "bg-yellow-400",  light: "bg-yellow-50",  text: "text-yellow-600" },
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

    // Group: project → board → columns
    const projectMap = new Map<string, {
        projectName: string;
        boards: Map<string, { boardName: string; columns: ColumnStat[] }>;
    }>();

    byColumn.forEach(col => {
        const pKey = col.projectId || 'unknown';
        const pName = col.projectName || 'Unknown Project';
        const bKey = col.boardId || 'unknown';
        const bName = col.boardName || 'Unknown Board';

        if (!projectMap.has(pKey)) {
            projectMap.set(pKey, { projectName: pName, boards: new Map() });
        }
        const project = projectMap.get(pKey)!;
        if (!project.boards.has(bKey)) {
            project.boards.set(bKey, { boardName: bName, columns: [] });
        }
        project.boards.get(bKey)!.columns.push(col);
    });

    // Assign a stable color per column name across the whole dataset
    const colorMap = new Map<string, typeof COLUMN_COLORS[0]>();
    let colorIdx = 0;
    byColumn.forEach(col => {
        if (!colorMap.has(col.name)) {
            colorMap.set(col.name, COLUMN_COLORS[colorIdx % COLUMN_COLORS.length]);
            colorIdx++;
        }
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Columns className="w-4 h-4 text-blue-600" />
                    Tasks by Column
                </h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {totalTasks} total tasks
                </span>
            </div>

            <div className="space-y-5">
                {Array.from(projectMap.entries()).map(([pKey, project]) => (
                    <div key={pKey}>
                        {/* Project label */}
                        <div className="flex items-center gap-1.5 mb-2">
                            <FolderOpen className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                                {project.projectName}
                            </span>
                        </div>

                        <div className="space-y-4 pl-2 border-l-2 border-indigo-100">
                            {Array.from(project.boards.entries()).map(([bKey, board]) => {
                                const boardTotal = board.columns.reduce((s, c) => s + c.count, 0);

                                return (
                                    <div key={bKey}>
                                        {/* Board label */}
                                        <div className="flex items-center justify-between mb-2 pl-2">
                                            <div className="flex items-center gap-1.5">
                                                <Layout className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                <span className="text-xs font-semibold text-gray-600">
                                                    {board.boardName}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {boardTotal} tasks
                                            </span>
                                        </div>

                                        {/* Columns */}
                                        <div className="space-y-2 pl-2">
                                            {board.columns.map(col => {
                                                const color = colorMap.get(col.name) || COLUMN_COLORS[0];
                                                const pctOfBoard = boardTotal > 0 ? (col.count / boardTotal) * 100 : 0;
                                                const pctOfTotal = totalTasks > 0 ? (col.count / totalTasks) * 100 : 0;

                                                return (
                                                    <div key={col.listId}>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                                                                <span className={`w-2 h-2 rounded-sm flex-shrink-0 ${color.bar}`} />
                                                                {col.name}
                                                            </span>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="text-xs font-bold text-gray-800">
                                                                    {col.count}
                                                                </span>
                                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color.light} ${color.text}`}>
                                                                    {pctOfBoard.toFixed(0)}% of board
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                                                                style={{ width: `${Math.max(pctOfBoard, col.count > 0 ? 2 : 0)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Board proportion strip */}
                                            {boardTotal > 0 && board.columns.length > 1 && (
                                                <div className="flex h-1.5 rounded-full overflow-hidden gap-px mt-1">
                                                    {board.columns.map(col => {
                                                        const color = colorMap.get(col.name) || COLUMN_COLORS[0];
                                                        const pct = (col.count / boardTotal) * 100;
                                                        if (pct === 0) return null;
                                                        return (
                                                            <div
                                                                key={col.listId}
                                                                className={`${color.bar}`}
                                                                style={{ width: `${pct}%` }}
                                                                title={`${col.name}: ${col.count}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
