import { Search } from "lucide-react";

export function SearchBar() {
    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                placeholder="Search tasks or projects..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-100 focus:border-blue-500 rounded-xl text-sm font-medium transition-all outline-none"
            />
        </div>
    );
}
