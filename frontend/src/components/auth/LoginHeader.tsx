import { CheckCircle2 } from "lucide-react";

interface LoginHeaderProps {
    isVerified: boolean;
    message?: string | null;
}

export default function LoginHeader({ isVerified, message }: LoginHeaderProps) {
    const showAlreadyVerified = message === 'already-verified';
    
    return (
        <>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Please enter your details to sign in.
                </p>
            </div>

            {isVerified && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Email verified successfully. Please log in to continue.
                </div>
            )}
            
            {showAlreadyVerified && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Your account is already verified. Please log in to continue.
                </div>
            )}
        </>
    );
}
