"use client";

import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useWorkspaces } from "@/hooks/api";

export default function WorkspaceDebug() {
    const { workspaces, activeWorkspace } = useWorkspaceStore();
    const { data: apiWorkspaces } = useWorkspaces();

    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md max-h-96 overflow-auto z-[9999]">
            <h3 className="font-bold mb-2">Workspace Debug Info</h3>
            
            <div className="mb-3">
                <p className="font-semibold text-yellow-400">Active Workspace:</p>
                <pre className="text-[10px] overflow-auto">
                    {JSON.stringify(activeWorkspace, null, 2)}
                </pre>
            </div>

            <div className="mb-3">
                <p className="font-semibold text-green-400">Store Workspaces ({workspaces.length}):</p>
                <pre className="text-[10px] overflow-auto">
                    {JSON.stringify(workspaces, null, 2)}
                </pre>
            </div>

            <div>
                <p className="font-semibold text-blue-400">API Workspaces ({apiWorkspaces?.length || 0}):</p>
                <pre className="text-[10px] overflow-auto">
                    {JSON.stringify(apiWorkspaces, null, 2)}
                </pre>
            </div>
        </div>
    );
}
