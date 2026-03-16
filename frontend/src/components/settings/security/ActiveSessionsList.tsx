import { Monitor, Smartphone, Tablet, LogOut, MapPin, Clock, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface Session {
    id: number;
    browser: string;
    location: string;
    timestamp: string;
    current: boolean;
    device?: string;
    ipAddress?: string;
}

interface ActiveSessionsListProps {
    sessions: Session[];
    onLogoutSession: (sessionId: number) => void;
    onLogoutAll: () => void;
}

export default function ActiveSessionsList({ sessions, onLogoutSession, onLogoutAll }: ActiveSessionsListProps) {
    const [showMenu, setShowMenu] = useState(false);

    const getTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'Active Now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const getDeviceIcon = (browser: string, device?: string) => {
        const deviceLower = (device || browser).toLowerCase();
        if (deviceLower.includes('mobile') || deviceLower.includes('android') || deviceLower.includes('iphone')) {
            return <Smartphone className="w-4 h-4" />;
        }
        if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
            return <Tablet className="w-4 h-4" />;
        }
        return <Monitor className="w-4 h-4" />;
    };

    const handleLogoutAllExceptCurrent = () => {
        sessions.forEach(session => {
            if (!session.current) {
                onLogoutSession(session.id);
            }
        });
        setShowMenu(false);
    };

    const handleLogoutAllIncludingCurrent = () => {
        onLogoutAll();
        setShowMenu(false);
    };

    return (
        <Card variant="bordered">
            <CardHeader divider>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            Active Sessions
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            Manage devices where you're currently logged in
                        </p>
                    </div>
                    {sessions.length > 1 && (
                        <div className="relative w-full sm:w-auto">
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setShowMenu(!showMenu)}
                                className="w-full sm:w-auto"
                            >
                                <LogOut className="w-3 h-3 mr-1.5" />
                                Logout Options
                                <MoreVertical className="w-3 h-3 ml-1" />
                            </Button>
                            
                            {showMenu && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setShowMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                        <button
                                            onClick={handleLogoutAllExceptCurrent}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <div className="text-left">
                                                <div>Logout All Other Devices</div>
                                                <div className="text-[9px] text-gray-500 font-normal">Keep this device signed in</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleLogoutAllIncludingCurrent}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 rounded-b-lg"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <div className="text-left">
                                                <div>Logout All Devices</div>
                                                <div className="text-[9px] text-red-500 font-normal">Including this device</div>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardBody>
                <div className="space-y-2">
                    {sessions.length === 0 ? (
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                <Smartphone className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-xs font-medium text-gray-900">No active sessions</p>
                            <p className="text-[10px] text-gray-500 mt-1">You'll see your active devices here</p>
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div 
                                key={session.id} 
                                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                            {getDeviceIcon(session.browser, session.device)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-xs font-bold text-gray-900">{session.browser}</p>
                                                {session.current && (
                                                    <Badge variant="success" size="sm" dot>
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <span>{session.location}</span>
                                                    {session.ipAddress && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="font-mono">{session.ipAddress}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span>{getTimeAgo(session.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.current && (
                                        <button 
                                            onClick={() => onLogoutSession(session.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                                            title="Logout this session"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
