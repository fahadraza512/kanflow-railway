import { Calendar } from "lucide-react";

interface ActivityDay {
    date: string;
    completed: number;
    created: number;
}

interface RecentActivityChartProps {
    recentActivity: ActivityDay[];
}

export default function RecentActivityChart({ recentActivity }: RecentActivityChartProps) {
    const maxValue = Math.max(...recentActivity.map(d => Math.max(d.completed, d.created)));

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-600" />
                Recent Activity (Last 7 Days)
            </h2>
            <div className="flex items-end justify-between gap-1 h-32">
                {recentActivity.map((day, idx) => {
                    const completedHeight = maxValue > 0 ? (day.completed / maxValue) * 100 : 0;
                    const createdHeight = maxValue > 0 ? (day.created / maxValue) * 100 : 0;
                    
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center gap-0.5 h-28">
                                <div 
                                    className="w-full bg-green-600 rounded-t transition-all hover:bg-green-700"
                                    style={{ height: `${completedHeight}%`, minHeight: day.completed > 0 ? '6px' : '0' }}
                                    title={`Completed: ${day.completed}`}
                                />
                                <div 
                                    className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                                    style={{ height: `${createdHeight}%`, minHeight: day.created > 0 ? '6px' : '0' }}
                                    title={`Created: ${day.created}`}
                                />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400">{day.date}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-600 rounded"></div>
                    <span className="text-[10px] font-semibold text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-600 rounded"></div>
                    <span className="text-[10px] font-semibold text-gray-600">Created</span>
                </div>
            </div>
        </div>
    );
}
