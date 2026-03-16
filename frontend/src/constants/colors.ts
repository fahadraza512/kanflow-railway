export const COVER_COLORS = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#A855F7" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Pink", value: "#EC4899" },
] as const;

export type CoverColor = typeof COVER_COLORS[number];
