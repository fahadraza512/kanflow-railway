import { useRef } from "react";
import { Layout, Camera, Users, Calendar, X } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Workspace } from "@/lib/storage";

interface WorkspaceInfoCardProps {
    workspace: Workspace | null;
    formData: {
        name: string;
        description: string;
    };
    workspaceIcon: string | null;
    nameError: string;
    isSaving: boolean;
    isOwner?: boolean;
    onNameChange: (name: string) => void;
    onFormChange: (updates: Partial<{
        name: string;
        description: string;
    }>) => void;
    onIconUpload: (file: File) => void;
    onIconRemove: () => void;
    onSave: () => void;
}

export default function WorkspaceInfoCard({
    workspace,
    formData,
    workspaceIcon,
    nameError,
    isSaving,
    isOwner = true,
    onNameChange,
    onFormChange,
    onIconUpload,
    onIconRemove,
    onSave
}: WorkspaceInfoCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onIconUpload(file);
        }
    };

    return (
        <Card variant="bordered">
            <CardBody>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="relative w-16 h-16 flex-shrink-0">
                        {/* Clickable image container */}
                        <div
                            className={`relative w-16 h-16 rounded-lg bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-600 overflow-hidden ${isOwner ? 'cursor-pointer group' : ''}`}
                            onClick={() => isOwner && fileInputRef.current?.click()}
                        >
                            {workspaceIcon ? (
                                <img
                                    src={workspaceIcon}
                                    alt="Workspace icon"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Layout className="w-6 h-6" />
                            )}
                            {/* Camera overlay on hover */}
                            {isOwner && (
                                <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            disabled={!isOwner}
                        />
                        {/* Remove button — tiny red dot top-left */}
                        {isOwner && workspaceIcon && (
                            <span
                                onClick={(e) => { e.stopPropagation(); onIconRemove(); }}
                                title="Remove image"
                                style={{
                                    position: 'absolute',
                                    top: -4,
                                    left: -4,
                                    width: 16,
                                    height: 16,
                                    minWidth: 16,
                                    maxWidth: 16,
                                    minHeight: 16,
                                    maxHeight: 16,
                                    borderRadius: '50%',
                                    backgroundColor: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                }}
                            >
                                <X style={{ width: 8, height: 8, color: 'white', flexShrink: 0 }} />
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">{formData.name}</h3>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mt-0.5">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> 
                                {workspace?.members?.length || 0} Member{(workspace?.members?.length || 0) !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> 
                                {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-3">
                    <Input
                        label="Workspace Name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => onNameChange(e.target.value)}
                        error={nameError}
                        disabled={!isOwner}
                    />

                    <Textarea
                        label="Description"
                        value={formData.description}
                        onChange={(e) => onFormChange({ description: e.target.value })}
                        rows={3}
                        placeholder="Describe your workspace..."
                        disabled={!isOwner}
                    />
                </div>

                {isOwner && (
                    <div className="flex justify-end pt-3 border-t border-gray-100">
                        <Button
                            onClick={onSave}
                            disabled={isSaving || !formData.name.trim() || !!nameError}
                            variant="primary"
                            isLoading={isSaving}
                        >
                            {isSaving ? "Saving..." : "Update Workspace"}
                        </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
