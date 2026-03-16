export const PRIORITIES = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent"
} as const;

export type Priority = typeof PRIORITIES[keyof typeof PRIORITIES];

export const PRIORITY_LABELS = {
    [PRIORITIES.LOW]: "Low",
    [PRIORITIES.MEDIUM]: "Medium",
    [PRIORITIES.HIGH]: "High",
    [PRIORITIES.URGENT]: "Urgent"
} as const;

export const PRIORITY_COLORS = {
    [PRIORITIES.LOW]: "text-green-600 bg-green-50",
    [PRIORITIES.MEDIUM]: "text-yellow-600 bg-yellow-50",
    [PRIORITIES.HIGH]: "text-orange-600 bg-orange-50",
    [PRIORITIES.URGENT]: "text-red-600 bg-red-50"
} as const;
