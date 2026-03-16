import { User, Mail, Shield, SwitchCamera } from "lucide-react";

interface ProfileFormFieldsProps {
    formData: {
        name: string;
        email: string;
        title: string;
        bio: string;
    };
    onUpdate: (field: "name" | "title" | "email" | "bio", value: string) => void;
}

export default function ProfileFormFields({ formData, onUpdate }: ProfileFormFieldsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    <User className="w-3 h-3" /> Full Name
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onUpdate('name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
            </div>
            <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    <Mail className="w-3 h-3" /> Email Address
                </label>
                <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 cursor-not-allowed outline-none"
                />
            </div>
            <div className="space-y-1.5 md:col-span-2">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    <SwitchCamera className="w-3 h-3" /> Professional Title
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => onUpdate('title', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                />
            </div>
            <div className="space-y-1.5 md:col-span-2">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    <Shield className="w-3 h-3" /> Biography
                </label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => onUpdate('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none resize-none"
                />
            </div>
        </div>
    );
}
