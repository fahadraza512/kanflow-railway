import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link
                href="/dashboard"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>
            
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                
                return (
                    <div key={index} className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[150px]"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-900 font-medium truncate max-w-[150px]">
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
