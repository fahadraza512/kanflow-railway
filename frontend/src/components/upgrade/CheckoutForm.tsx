import { CreditCard, Shield } from "lucide-react";
import { clsx } from "clsx";

interface CheckoutFormProps {
    billingCycle: "annual" | "monthly";
    isProcessing: boolean;
    onSubmit: () => void;
    onBack: () => void;
}

export default function CheckoutForm({
    billingCycle,
    isProcessing,
    onSubmit,
    onBack
}: CheckoutFormProps) {
    const amount = billingCycle === "annual" ? "120.00" : "12.00";

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-1">Secure Checkout</h3>
                <p className="text-gray-500 text-xs">Powered by Stripe</p>
            </div>

            <div className="space-y-3 flex-1">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Card Details</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="4242 4242 4242 4242"
                            defaultValue="4242 4242 4242 4242"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</label>
                        <input
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-colors"
                            placeholder="MM/YY"
                            defaultValue="12/28"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CVC</label>
                        <input
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-colors"
                            placeholder="123"
                            defaultValue="123"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={onSubmit}
                disabled={isProcessing}
                className={clsx(
                    "w-full mt-4 py-2 text-white font-semibold rounded-lg transition-colors shadow-md flex items-center justify-center gap-1.5 text-xs",
                    isProcessing ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Shield className="w-3.5 h-3.5" />
                        Pay ${amount}
                    </>
                )}
            </button>
            <button
                onClick={onBack}
                className="w-full mt-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
                Go back to plans
            </button>
        </div>
    );
}
