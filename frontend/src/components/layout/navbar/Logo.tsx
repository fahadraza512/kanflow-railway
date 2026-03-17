import Link from "next/link";

interface LogoProps {
    href?: string;
    size?: "sm" | "md" | "lg";
    /** If true, wraps in a Link. Default true. */
    asLink?: boolean;
}

const sizes = {
    sm: { icon: "w-8 h-8 text-lg",  text: "text-xl" },
    md: { icon: "w-10 h-10 text-xl", text: "text-2xl" },
    lg: { icon: "w-14 h-14 text-3xl", text: "text-4xl" },
};

export function AppLogo({ href = "/", size = "sm", asLink = true }: LogoProps) {
    const s = sizes[size];
    const inner = (
        <span className="flex items-center gap-2.5">
            <span className={`${s.icon} bg-blue-600 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0`}>
                K
            </span>
            <span className={`${s.text} font-black text-gray-900 tracking-tight`}>KanbanFlow</span>
        </span>
    );

    if (!asLink) return inner;
    return <Link href={href} className="flex items-center">{inner}</Link>;
}

/** @deprecated use AppLogo */
export function Logo({ href }: { href: string }) {
    return <AppLogo href={href} size="sm" />;
}
