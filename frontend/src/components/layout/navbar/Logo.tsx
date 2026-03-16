import Link from "next/link";

interface LogoProps {
    href: string;
}

export function Logo({ href }: LogoProps) {
    return (
        <Link href={href} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                K
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">KanbanFlow</span>
        </Link>
    );
}
