import { useState } from "react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { CustomField } from "@/types/customField";
import { Settings2 } from "lucide-react";

interface CustomFieldsSectionProps {
  taskId: string | number;
  customFieldValues: { fieldId: string | number; value: any }[];
  onUpdate: (values: { fieldId: string | number; value: any }[]) => void;
  readOnly?: boolean;
}

export function CustomFieldsSection({
  taskId,
  customFieldValues = [],
  onUpdate,
  readOnly,
}: CustomFieldsSectionProps) {
  const { fields } = useCustomFields();

  if (fields.length === 0) return null;

  const getValue = (fieldId: string | number) => {
    return customFieldValues.find((v) => v.fieldId === fieldId)?.value || "";
  };

  const handleChange = (fieldId: string | number, value: any) => {
    const updated = [...customFieldValues];
    const index = updated.findIndex((v) => v.fieldId === fieldId);

    if (index >= 0) {
      updated[index] = { fieldId, value };
    } else {
      updated.push({ fieldId, value });
    }

    onUpdate(updated);
  };

  const renderField = (field: CustomField) => {
    const value = getValue(field.id);

    if (readOnly) {
      return (
        <div key={field.id} className="space-y-1">
          <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="text-sm text-gray-900">
            {value || <span className="text-gray-400">Not set</span>}
          </div>
        </div>
      );
    }

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${field.name.toLowerCase()}`}
            />
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${field.name.toLowerCase()}`}
            />
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case "email":
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="email"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${field.name.toLowerCase()}`}
            />
          </div>
        );

      case "url":
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="url"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select {field.name.toLowerCase()}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-1">
              {field.options?.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option]
                        : selectedValues.filter((v) => v !== option);
                      handleChange(field.id, newValues);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Custom Fields</h3>
      </div>
      <div className="space-y-3">
        {fields.map((field) => renderField(field))}
      </div>
    </div>
  );
}
