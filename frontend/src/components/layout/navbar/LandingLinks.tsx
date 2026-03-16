import Link from "next/link";

export function LandingLinks() {
    return (
        <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-gray-900 transition-colors">
                Features
            </Link>
            <Link href="#pricing" className="hover:text-gray-900 transition-colors">
                Pricing
            </Link>
            <Link href="#integrations" className="hover:text-gray-900 transition-colors">
                Integrations
            </Link>
        </div>
    );
}
