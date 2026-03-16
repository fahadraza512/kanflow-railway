import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

interface ExpiryWarningProps {
    daysUntilExpiry: number;
    onReactivate: () => void;
}

export default function ExpiryWarning({ daysUntilExpiry, onReactivate }: ExpiryWarningProps) {
    if (daysUntilExpiry <= 0 || daysUntilExpiry > 3) {
        return null;
    }

    return (
        <Alert variant="warning" icon={true}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h4 className="font-bold text-base mb-1">
                        ⏰ Your Pro subscription expires in {daysUntilExpiry} day{daysUntilExpiry > 1 ? 's' : ''}!
                    </h4>
                    <p className="text-sm">
                        Reactivate now to continue enjoying unlimited boards, advanced analytics, and priority support without interruption.
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onReactivate}
                    className="whitespace-nowrap"
                >
                    Reactivate Now
                </Button>
            </div>
        </Alert>
    );
}
