import { Lock } from "lucide-react";

interface TwoFactorFormProps {
    tfaCode: string;
    onCodeChange: (code: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

export default function TwoFactorForm({
    tfaCode,
    onCodeChange,
    onSubmit,
    onBack
}: TwoFactorFormProps) {
    return (
        <form className="space-y-6" onSubmit={onSubmit}>
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mt-2">
                    Enter the 6-digit code from your authenticator app or use your backup code.
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Authentication Code</label>
                <input
                    type="text"
                    required
                    maxLength={6}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                    value={tfaCode}
                    onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
                />
            </div>

            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Verify & Login
                </button>
            </div>

            <button
                type="button"
                onClick={onBack}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
                ← Back to login
            </button>
        </form>
    );
}
