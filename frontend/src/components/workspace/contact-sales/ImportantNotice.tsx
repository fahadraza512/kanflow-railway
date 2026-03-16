interface ImportantNoticeProps {
    isExistingWorkspace: boolean;
}

export function ImportantNotice({ isExistingWorkspace }: ImportantNoticeProps) {
    return (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">⚠</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-bold text-amber-900 mb-1">Important:</h4>
                    {isExistingWorkspace ? (
                        <ul className="text-[10px] text-amber-800 space-y-1 leading-relaxed">
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>This request is for your <strong>existing workspace</strong>.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>Your workspace will <strong>remain on its current plan</strong> until the Kanban Flow team contacts you.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>The sales team will reach out to discuss Enterprise pricing and features.</span>
                            </li>
                        </ul>
                    ) : (
                        <ul className="text-[10px] text-amber-800 space-y-1 leading-relaxed">
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span><strong>Do NOT delete this workspace</strong> after submitting the Enterprise request.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>After submission, your workspace will automatically continue on the <strong>Free plan</strong> until the Kanban Flow team contacts you regarding the Enterprise plan.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <span>You may upgrade this same workspace to the <strong>Pro plan</strong> anytime after submitting the form from <a href="/settings/billing" className="text-blue-600 hover:underline font-semibold">Settings → Billing</a>.</span>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
