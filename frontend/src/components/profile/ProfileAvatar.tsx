import { Camera } from "lucide-react";

interface ProfileAvatarProps {
    avatarPreview: string | null;
    name: string;
    email: string;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}

export default function ProfileAvatar({ avatarPreview, name, email, onUpload, onRemove }: ProfileAvatarProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="relative group">
                {avatarPreview ? (
                    <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-20 h-20 rounded-lg object-cover shadow-sm"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-lg bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                >
                    <Camera className="w-3.5 h-3.5" />
                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUpload}
                    />
                </label>
            </div>
            <div className="text-center md:text-left flex-1">
                <h3 className="text-base font-bold text-gray-900 mb-0.5">{name}</h3>
                <p className="text-xs text-gray-500 mb-2">{email}</p>
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    <label
                        htmlFor="avatar-upload-btn"
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                        Upload New Avatar
                        <input
                            id="avatar-upload-btn"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onUpload}
                        />
                    </label>
                    <button
                        onClick={onRemove}
                        className="px-3 py-1.5 text-gray-500 rounded-lg text-[10px] font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
