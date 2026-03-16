import { useState } from "react";
import { CreditCard, Shield } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaymentModal from "./PaymentModal";

export default function PaymentMethodCard() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    return (
        <>
            <Card>
                <CardHeader divider>
                    <h2 className="text-sm font-bold text-gray-900">Payment Method</h2>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                <CreditCard className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-900">•••• •••• •••• 4242</p>
                                <p className="text-[10px] text-gray-500">Expires 12/2028</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="w-full sm:w-auto shrink-0"
                        >
                            Update
                        </Button>
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                        <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-semibold text-blue-900 mb-0.5">Secure Payment Processing</p>
                            <p className="text-[9px] text-blue-700">
                                Payments are processed securely through Stripe. Your card information is encrypted and never stored on our servers.
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        </>
    );
}
