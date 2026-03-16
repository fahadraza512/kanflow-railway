import { AlertTriangle, RefreshCw, Home, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
    type?: "404" | "403" | "500" | "network" | "generic";
    title?: string;
    message?: string;
    onRetry?: () => void;
    showHomeButton?: boolean;
}

export default function ErrorState({
    type = "generic",
    title,
    message,
    onRetry,
    showHomeButton = true
}: ErrorStateProps) {
    const router = useRouter();

    const errorConfig = {
        "404": {
            icon: AlertTriangle,
            iconColor: "text-yellow-600",
            bgColor: "bg-yellow-100",
            defaultTitle: "Not Found",
            defaultMessage: "The resource you're looking for doesn't exist or has been removed."
        },
        "403": {
            icon: Lock,
            iconColor: "text-red-600",
            bgColor: "bg-red-100",
            defaultTitle: "Access Denied",
            defaultMessage: "You don't have permission to access this resource."
        },
        "500": {
            icon: AlertTriangle,
            iconColor: "text-red-600",
            bgColor: "bg-red-100",
            defaultTitle: "Server Error",
            defaultMessage: "Something went wrong on our end. Please try again later."
        },
        "network": {
            icon: AlertTriangle,
            iconColor: "text-orange-600",
            bgColor: "bg-orange-100",
            defaultTitle: "Connection Error",
            defaultMessage: "Unable to connect to the server. Please check your internet connection."
        },
        "generic": {
            icon: AlertTriangle,
            iconColor: "text-gray-600",
            bgColor: "bg-gray-100",
            defaultTitle: "Something Went Wrong",
            defaultMessage: "An unexpected error occurred. Please try again."
        }
    };

    const config = errorConfig[type];
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
            <div className="text-center max-w-md">
                <div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${config.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {title || config.defaultTitle}
                </h3>
                <p className="text-gray-600 mb-6">
                    {message || config.defaultMessage}
                </p>
                <div className="flex items-center justify-center gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                    )}
                    {showHomeButton && (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            <Home className="w-4 h-4" />
                            Go to Dashboard
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
