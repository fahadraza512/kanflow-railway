import { SelectHTMLAttributes, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, icon, options, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        {icon}
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <select
                        ref={ref}
                        className={clsx(
                            "w-full px-3 py-2 pr-10 bg-white border rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer",
                            icon && "pl-9",
                            error ? "border-red-300 focus:ring-red-500" : "border-gray-200 hover:border-gray-300",
                            className
                        )}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                        }}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                {error && (
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
