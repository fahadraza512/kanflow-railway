import { Archive } from "lucide-react";

export default function ArchivedInfoBox() {
    return (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" />
                About Archived Tasks
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed">
                Archived tasks are hidden from board views and excluded from analytics. 
                You can restore them anytime or permanently delete them if no longer needed.
            </p>
        </div>
    );
}
