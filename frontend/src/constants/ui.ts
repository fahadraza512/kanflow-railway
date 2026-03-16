export const MODAL_SIZES = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
} as const;

export const BUTTON_VARIANTS = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-gray-600 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50"
} as const;

export const BUTTON_SIZES = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
} as const;

export const Z_INDEX = {
    dropdown: 50,
    modal: 100,
    toast: 200,
    tooltip: 300
} as const;
