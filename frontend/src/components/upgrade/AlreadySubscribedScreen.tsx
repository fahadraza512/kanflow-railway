import { Shield } from "lucide-react";

interface AlreadySubscribedScreenProps {
    onClose: () => void;
}

export default function AlreadySubscribedScreen({ onClose }: AlreadySubscribedScreenProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">Already Subscribed</h3>
            <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto">
                You are already subscribed to the Pro plan. Please cancel your current subscription from the Billing page to choose a new plan.
            </p>
            <div className="w-full space-y-2">
                <button
                    onClick={() => {
                        onClose();
                        if (typeof window !== 'undefined') {
                            window.location.href = "/settings/billing";
                        }
                    }}
                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md text-xs"
                >
                    Go to Billing
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-xs"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
