// Global functions loaded via <Script> from eternityready.com/lib/tracking.js
declare function getTracking(): {
  visits: Record<string, any>;
  sessions: Record<string, any>;
};
declare function setTracking(tracking: {
  visits: Record<string, any>;
  sessions: Record<string, any>;
}): void;
declare function trackMediaPlayback(
  mediaTitle: string,
  mediaData: { origin: string; categories: string[] }
): void;
declare function getTopItems(opts: {
  limit?: number;
  origins: string[];
}): Array<{ title: string; origin: string; total_consumption_seconds: number; [key: string]: any }>;
declare function getRecentlyWatched(opts?: {
  limit?: number;
  maxAgeMs?: number;
  origins: string[];
}): Array<{ title: string; origin: string; total_consumption_seconds: number; lastActivity: number; [key: string]: any }>;
declare function getMostConsumedCategories(opts?: {
  limit?: number;
  origins: string[];
}): Array<{ category: string; total_consumption_seconds: number }>;
