export interface Label {
  id: string | number;
  workspaceId: string | number;
  name: string;
  color: string; // hex color
  createdAt: string;
}

export const DEFAULT_LABEL_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6B7280', // gray
  '#14B8A6', // teal
  '#F97316', // orange
  '#06B6D4', // cyan
];
