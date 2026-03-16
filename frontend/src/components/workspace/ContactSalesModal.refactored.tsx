"use client";

import { Building2, Mail, Users } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FormHeader } from "./contact-sales/FormHeader";
import { ImportantNotice } from "./contact-sales/ImportantNotice";
import { useContactSales } from "@/hooks/useContactSales";

interface ContactSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    workspaceData?: {
        workspaceId: string;
        workspaceName: string;
    } | null;
    isExistingWorkspace?: boolean;
}

const teamSizeOptions = [
    { value: "", label: "Select team size" },
    { value: "1-10", label: "1-10 members" },
    { value: "11-50", label: "11-50 members" },
    { value: "51-200", label: "51-200 members" },
    { value: "201-500", label: "201-500 members" },
    { value: "500+", label: "500+ members" }
];

export default function ContactSalesModal({
    isOpen,
    onClose,
    onSuccess,
    workspaceData,
    isExistingWorkspace = false
}: ContactSalesModalProps) {
    const {
        formData,
        isSubmitting,
        workspaceName,
        workspaceId,
        isFormValid,
        handleSubmit,
        handleChange
    } = useContactSales({ isOpen, workspaceData, onSuccess });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                <FormHeader workspaceName={workspaceName} onClose={onClose} />

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <form id="contact-sales-form-refactored" onSubmit={handleSubmit} className="p-4 space-y-2.5 bg-gradient-to-b from-gray-50/50 to-white">
                    <Input
                        type="text"
                        name="workspaceName"
                        label="Workspace Name"
                        icon={<Building2 className="w-3.5 h-3.5" />}
                        value={workspaceName}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                        helperText="This is the workspace for your Enterprise request"
                    />

                    <input type="hidden" name="workspaceId" value={workspaceId} />

                    <Input
                        type="text"
                        name="fullName"
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="email"
                        name="workEmail"
                        label="Work Email"
                        icon={<Mail className="w-3.5 h-3.5" />}
                        placeholder="john@company.com"
                        value={formData.workEmail}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        type="text"
                        name="companyName"
                        label="Company Name"
                        icon={<Building2 className="w-3.5 h-3.5" />}
                        placeholder="Acme Inc."
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                    />

                    <Select
                        name="teamSize"
                        label="Team Size"
                        icon={<Users className="w-3.5 h-3.5" />}
                        options={teamSizeOptions}
                        value={formData.teamSize}
                        onChange={handleChange}
                        required
                    />

                    <Textarea
                        name="message"
                        label="Message (Optional)"
                        placeholder="Tell us about your needs..."
                        value={formData.message}
                        onChange={handleChange}
                        rows={2}
                    />

                    <ImportantNotice isExistingWorkspace={isExistingWorkspace} />
                    </form>
                </div>

                <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="contact-sales-form-refactored"
                            variant="primary"
                            disabled={!isFormValid || isSubmitting}
                            isLoading={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg"
                        >
                            Submit Request
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
