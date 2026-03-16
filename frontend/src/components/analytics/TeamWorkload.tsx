import { Users } from "lucide-react";

interface TeamMember {
    userId: string | number;
    name: string;
    taskCount: number;
    completedCount: number;
}

interface TeamWorkloadProps {
    teamWorkload: TeamMember[];
}

export default function TeamWorkload({ teamWorkload }: TeamWorkloadProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Team Workload
            </h2>
            {teamWorkload.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-xs">No assigned tasks yet</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 text-[9px] font-bold text-gray-400 uppercase">Team Member</th>
                                <th className="text-center py-2 text-[9px] font-bold text-gray-400 uppercase">Total Tasks</th>
                                <th className="text-center py-2 text-[9px] font-bold text-gray-400 uppercase">Completed</th>
                                <th className="text-right py-2 text-[9px] font-bold text-gray-400 uppercase">Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamWorkload.map((member) => {
                                const rate = member.taskCount > 0 ? Math.round((member.completedCount / member.taskCount) * 100) : 0;
                                return (
                                    <tr key={member.userId} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-2 text-xs font-semibold text-gray-900">{member.name}</td>
                                        <td className="py-2 text-center text-xs font-bold text-gray-900">{member.taskCount}</td>
                                        <td className="py-2 text-center text-xs font-bold text-green-600">{member.completedCount}</td>
                                        <td className="py-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 w-10 text-right">{rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
