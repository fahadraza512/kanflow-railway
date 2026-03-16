import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface OverdueAlertProps {
    overdueCount: number;
}

export default function OverdueAlert({ overdueCount }: OverdueAlertProps) {
    const router = useRouter();

    if (overdueCount === 0) return null;

    const handleViewTasks = () => {
        router.push('/overdue-tasks');
    };

    return (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-semibold text-red-900 mb-0.5">
                    {overdueCount} overdue task{overdueCount > 1 ? 's' : ''} need{overdueCount === 1 ? 's' : ''} attention
                </p>
                <p className="text-xs text-red-700">
                    Review your tasks and update their due dates to stay on track
                </p>
            </div>
            <button 
                onClick={handleViewTasks}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
                View Tasks
            </button>
        </div>
    );
}
