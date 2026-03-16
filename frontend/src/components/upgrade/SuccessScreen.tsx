import { Zap } from "lucide-react";

interface SuccessScreenProps {
    onClose: () => void;
}

export default function SuccessScreen({ onClose }: SuccessScreenProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1.5">You&apos;re Pro!</h3>
            <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
                Your workspace has been upgraded. All premium features are now unlocked.
            </p>
            <button
                onClick={onClose}
                className="w-full py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors shadow-md text-xs"
            >
                Get Started
            </button>
        </div>
    );
}
