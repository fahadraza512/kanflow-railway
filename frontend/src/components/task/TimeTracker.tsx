import { useTimeTracking } from "@/hooks/useTimeTracking";
import { Clock, Play, Square, Plus } from "lucide-react";
import { useState } from "react";

interface TimeTrackerProps {
  taskId: string | number;
  readOnly?: boolean;
}

export function TimeTracker({ taskId, readOnly }: TimeTrackerProps) {
  const {
    isTracking,
    formattedTotal,
    formattedCurrent,
    startTracking,
    stopTracking,
  } = useTimeTracking(taskId);
  const [showManual, setShowManual] = useState(false);

  const handleToggle = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">Time Tracking</span>
        </div>
        {!readOnly && (
          <button
            onClick={handleToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isTracking
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isTracking ? (
              <>
                <Square className="w-3.5 h-3.5" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Start
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600">Total Time</p>
          <p className="text-lg font-semibold text-gray-900">{formattedTotal}</p>
        </div>
        {isTracking && (
          <div className="text-right">
            <p className="text-xs text-gray-600">Current Session</p>
            <p className="text-lg font-semibold text-blue-600 animate-pulse">
              {formattedCurrent}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
