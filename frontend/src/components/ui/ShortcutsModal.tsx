import { useState, useEffect } from "react";
import { X, Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["Ctrl", "K"], description: "Quick search", category: "Navigation" },
  { keys: ["/"], description: "Focus search", category: "Navigation" },
  { keys: ["Esc"], description: "Close modal/panel", category: "Navigation" },
  
  // Actions
  { keys: ["Ctrl", "N"], description: "New task", category: "Actions" },
  { keys: ["Ctrl", "Shift", "P"], description: "New project", category: "Actions" },
  { keys: ["Ctrl", "S"], description: "Save changes", category: "Actions" },
  
  // Task Management
  { keys: ["Enter"], description: "Submit form", category: "Task Management" },
  { keys: ["Ctrl", "Enter"], description: "Quick save", category: "Task Management" },
  { keys: ["Delete"], description: "Delete selected", category: "Task Management" },
  
  // Help
  { keys: ["?"], description: "Show shortcuts", category: "Help" },
];

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShow = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("show-shortcuts-modal", handleShow);
    window.addEventListener("close-modal", handleClose);

    return () => {
      window.removeEventListener("show-shortcuts-modal", handleShow);
      window.removeEventListener("close-modal", handleClose);
    };
  }, []);

  if (!isOpen) return null;

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
      <div
        className="absolute inset-0"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Speed up your workflow with these shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts
                    .filter((s) => s.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                {key}
                              </kbd>
                              {i < shortcut.keys.length - 1 && (
                                <span className="text-gray-400 dark:text-gray-500">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">?</kbd> anytime to see this list
          </p>
        </div>
      </div>
    </div>
  );
}
