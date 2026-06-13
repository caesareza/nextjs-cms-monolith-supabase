/**
 * Converts a duration in milliseconds into a human-readable string.
 * Optimized for Dashboard KPIs (e.g., "2d 5h", "14h 20m", "Under 1m")
 */
export const formatDuration = (ms: number): string => {
    if (ms <= 0) return "0m";

    const totalMinutes = Math.floor(ms / (1000 * 60));
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const remainingHours = totalHours % 24;
    const remainingMinutes = totalMinutes % 60;

    const parts: string[] = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (remainingHours > 0 || days > 0) {
        parts.push(`${remainingHours}h`);
    }

    // Only show minutes if the duration is less than a day
    // This keeps the UI clean for long-term roadmaps
    if (days === 0 && remainingMinutes > 0) {
        parts.push(`${remainingMinutes}m`);
    }

    return parts.join(" ") || "Under 1m";
};

/**
 * Formats an ISO string to a clean Banking Date format: "Mar 2026"
 */
export const formatProductionMonth = (dateString: string): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
    }).format(date);
};

/**
 * Standard timestamp for Audit Logs: "24 Mar 2026, 10:12"
 */
export const formatAuditTimestamp = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};