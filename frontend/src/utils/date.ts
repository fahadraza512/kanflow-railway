export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function getRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(date);
}

export function isOverdue(dueDate: string | Date | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

export function getDaysUntil(date: string | Date): number {
    const now = new Date();
    const target = new Date(date);
    const diffInMs = target.getTime() - now.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}
