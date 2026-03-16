import { Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface WorkspaceStepProps {
    workspaceName: string;
    avatarPreview: string | null;
    workspaceNameError: string;
    onWorkspaceNameChange: (name: string) => void;
    onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNext: () => void;
    showBackButton?: boolean;
    onBack?: () => void;
    isProcessing?: boolean;
    isCompressing?: boolean;
}

export default function WorkspaceStep({
    workspaceName,
    avatarPreview,
    workspaceNameError,
    onWorkspaceNameChange,
    onAvatarUpload,
    onNext,
    showBackButton = false,
    onBack,
    isProcessing = false,
    isCompressing = false
}: WorkspaceStepProps) {
    return (
        <div className="bg-white p-4 sm:p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
            {showBackButton && onBack && (
                <button
                    onClick={onBack}
                    className="mb-4 flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Dashboard
                </button>
            )}
            
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    Create your Workspace
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 px-2">
                    A workspace is where your team collaborates on projects.
                </p>
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center mb-6 sm:mb-8">
                <label className={`cursor-pointer group ${isCompressing ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarUpload}
                        disabled={isCompressing || isProcessing}
                    />
                    {avatarPreview ? (
                        <div className="relative">
                            <img
                                src={avatarPreview}
                                alt="Workspace avatar"
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-200"
                            />
                            {!isCompressing && (
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="w-5 h-5 text-white" />
                                </div>
                            )}
                            {isCompressing && (
                                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1 group-hover:border-blue-400 transition-colors">
                            {isCompressing ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 text-blue-400" />
                                    <span className="text-[10px] text-blue-400 font-medium">
                                        Logo
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </label>
            </div>

            {/* Workspace Name */}
            <Input
                label="Workspace Name"
                type="text"
                required
                placeholder="Acme Corp Team"
                value={workspaceName}
                onChange={(e) => onWorkspaceNameChange(e.target.value)}
                error={workspaceNameError}
            />

            <Button
                onClick={onNext}
                disabled={!workspaceName.trim() || !!workspaceNameError || isProcessing || isCompressing}
                variant="primary"
                fullWidth
                className="mt-6 sm:mt-8"
            >
                {isProcessing ? 'Processing...' : 'Next: Choose Plan'}
                {!isProcessing && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
        </div>
    );
}
