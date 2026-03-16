import { Upload } from "lucide-react";

interface WorkspaceAvatarUploadProps {
    avatarPreview: string | null;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function WorkspaceAvatarUpload({ avatarPreview, onUpload }: WorkspaceAvatarUploadProps) {
    return (
        <div className="flex justify-center mb-4">
            <label className="cursor-pointer group">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onUpload}
                />
                {avatarPreview ? (
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50"></div>
                        <img
                            src={avatarPreview}
                            alt="Workspace avatar"
                            className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 flex flex-col items-center justify-center gap-1 group-hover:border-blue-500 transition-all shadow-sm">
                            <Upload className="w-4 h-4 text-blue-500" />
                            <span className="text-[9px] text-blue-500 font-bold">
                                Upload
                            </span>
                        </div>
                    </div>
                )}
            </label>
        </div>
    );
}
