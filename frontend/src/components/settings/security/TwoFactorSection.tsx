import { SmartphoneNfc } from "lucide-react";
import { clsx } from "clsx";
import { Card, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface TwoFactorSectionProps {
    tfaEnabled: boolean;
    onToggle: () => void;
}

export default function TwoFactorSection({ tfaEnabled, onToggle }: TwoFactorSectionProps) {
    return (
        <Card variant="bordered">
            <CardBody>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className={clsx(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        tfaEnabled ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    )}>
                        <SmartphoneNfc className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h3>
                            <Badge variant={tfaEnabled ? "success" : "warning"} size="sm">
                                {tfaEnabled ? "Enabled" : "Recommended"}
                            </Badge>
                        </div>
                        <p className="text-[10px] text-gray-500">Add extra security with verification code</p>
                    </div>
                    <Button
                        variant={tfaEnabled ? "danger" : "primary"}
                        size="sm"
                        onClick={onToggle}
                        className="w-full sm:w-auto shrink-0"
                    >
                        {tfaEnabled ? "Disable" : "Enable"}
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}
