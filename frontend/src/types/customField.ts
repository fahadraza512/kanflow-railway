export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'url' | 'email';

export interface CustomField {
  id: string | number;
  workspaceId: string | number;
  name: string;
  type: CustomFieldType;
  options?: string[]; // For select/multiselect
  required: boolean;
  createdAt: string;
}

export interface TaskCustomFieldValue {
  fieldId: string | number;
  value: string | string[] | number | null;
}
