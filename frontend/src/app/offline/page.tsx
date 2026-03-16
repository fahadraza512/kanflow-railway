"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You're Offline
        </h1>

        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Some features may not be available until you're back online.
        </p>

        <button
          onClick={handleRefresh}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            KanbanFlow works best with an active internet connection
          </p>
        </div>
      </div>
    </div>
  );
}
