import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NoWorkspaceState() {
    return (
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Workspace Found</h2>
                <p className="text-gray-600 text-sm mb-6">
                    You don't have any workspaces yet. Create one to get started.
                </p>
                <div className="space-y-3">
                    <Link
                        href="/dashboard/workspace"
                        className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Create Workspace
                    </Link>
                    <Link
                        href="/dashboard"
                        className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
