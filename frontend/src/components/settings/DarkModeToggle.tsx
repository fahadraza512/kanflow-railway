import { useDarkMode } from "@/hooks/useDarkMode";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {isDark ? (
            <Moon className="w-5 h-5 text-gray-900 dark:text-gray-100" />
          ) : (
            <Sun className="w-5 h-5 text-gray-900 dark:text-gray-100" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Dark Mode
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDark ? "Dark theme enabled" : "Light theme enabled"}
          </p>
        </div>
      </div>

      <button
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDark ? "bg-blue-600" : "bg-gray-300"
        }`}
        aria-label="Toggle dark mode"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
