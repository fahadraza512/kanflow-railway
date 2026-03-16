import Link from "next/link";
import { Home, BarChart3, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationLinksProps {
  currentPath: string;
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/archived-tasks", icon: Archive, label: "Archived Tasks" },
] as const;

export function NavigationLinks({ currentPath }: NavigationLinksProps) {
  return (
    <div className="px-4 pt-4 pb-3 space-y-1.5">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-semibold text-xs",
            currentPath === href
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}
