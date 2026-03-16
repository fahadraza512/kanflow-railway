import { X, AlertCircle } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface CancelSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function CancelSubscriptionModal({
    isOpen,
    onClose,
    onConfirm
}: CancelSubscriptionModalProps) {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Cancel Subscription</h3>
                        <p className="text-[10px] text-gray-500">Are you sure?</p>
                    </div>
                </div>
            </ModalHeader>

            <ModalBody>
                <p className="text-[10px] text-gray-700 leading-relaxed mb-3">
                    If you cancel your subscription, you&apos;ll be downgraded to the Free plan at the end of your current billing period. 
                    You&apos;ll lose access to:
                </p>
                <ul className="space-y-1.5 text-[10px] text-gray-600">
                    <li className="flex items-center gap-1.5">
                        <X className="w-3 h-3 text-red-500" />
                        Unlimited boards
                    </li>
                    <li className="flex items-center gap-1.5">
                        <X className="w-3 h-3 text-red-500" />
                        Unlimited team members
                    </li>
                    <li className="flex items-center gap-1.5">
                        <X className="w-3 h-3 text-red-500" />
                        Advanced analytics
                    </li>
                    <li className="flex items-center gap-1.5">
                        <X className="w-3 h-3 text-red-500" />
                        Priority support
                    </li>
                </ul>
            </ModalBody>

            <ModalFooter>
                <Button
                    variant="outline"
                    onClick={onClose}
                    fullWidth
                >
                    Keep Subscription
                </Button>
                <Button
                    variant="danger"
                    onClick={onConfirm}
                    fullWidth
                >
                    Cancel Plan
                </Button>
            </ModalFooter>
        </Modal>
    );
}
