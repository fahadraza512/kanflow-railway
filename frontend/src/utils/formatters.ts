/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date, format: "short" | "long" = "short"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    
    if (format === "short") {
        return d.toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric" 
        });
    }
    
    return d.toLocaleDateString("en-US", { 
        month: "long", 
        day: "numeric", 
        year: "numeric" 
    });
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return formatDate(d);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Capitalize first letter of text
 */
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert text to URL-friendly slug
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular;
    return plural || `${singular}s`;
}
