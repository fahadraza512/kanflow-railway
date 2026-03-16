import { useState } from "react";
import { Shield } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardholderName, setCardholderName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate payment processing
        onClose();
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setCardholderName("");
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalHeader onClose={onClose}>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Update Payment Method</h3>
                    <p className="text-sm text-gray-500 mt-1">Enter your card details</p>
                </div>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
                <ModalBody>
                    <div className="space-y-4">
                        <Input
                            label="Cardholder Name"
                            type="text"
                            required
                            placeholder="John Doe"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                        />

                        <Input
                            label="Card Number"
                            type="text"
                            required
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\s/g, '');
                                const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                                setCardNumber(formatted);
                            }}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Expiry Date"
                                type="text"
                                required
                                placeholder="MM/YY"
                                maxLength={5}
                                value={expiryDate}
                                onChange={(e) => {
                                    let value = e.target.value.replace(/\D/g, '');
                                    if (value.length >= 2) {
                                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                    }
                                    setExpiryDate(value);
                                }}
                            />

                            <Input
                                label="CVV"
                                type="text"
                                required
                                placeholder="123"
                                maxLength={3}
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Shield className="w-4 h-4" />
                                <span>Secured by Stripe. Demo mode - no real charges.</span>
                            </div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        fullWidth
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                    >
                        Update Card
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}
