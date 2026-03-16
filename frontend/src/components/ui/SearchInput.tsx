import { InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export function SearchInput({
  value,
  onClear,
  showClearButton = true,
  className,
  ...props
}: SearchInputProps) {
  const hasValue = value && String(value).length > 0;

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        className={cn(
          "w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "placeholder:text-gray-400",
          className
        )}
        {...props}
      />
      {showClearButton && hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
