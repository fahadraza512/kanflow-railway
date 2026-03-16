import { Key } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PasswordSectionProps {
    lastPasswordChange?: Date | string | null;
    onChangePassword: () => void;
}

export default function PasswordSection({ lastPasswordChange, onChangePassword }: PasswordSectionProps) {
    const getTimeAgo = (date: Date | string | null | undefined) => {
        if (!date) return 'never';
        
        // Convert to Date object if it's a string
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        
        // Check if date is valid
        if (isNaN(dateObj.getTime())) return 'never';
        
        const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
        const months = Math.floor(days / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    };

    return (
        <Card variant="bordered">
            <CardBody>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Key className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900">Password</h3>
                        <p className="text-[10px] text-gray-500">Last changed {getTimeAgo(lastPasswordChange)}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onChangePassword}
                        className="w-full sm:w-auto shrink-0"
                    >
                        Change Password
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}
