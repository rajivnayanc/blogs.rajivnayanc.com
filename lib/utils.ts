/**
 * Utility to merge class names (used by shadcn/ui components).
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date string to a human-readable format.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Convert a title string to a URL-safe slug.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Prepends the base path to an absolute URL if it's not already present.
 * Used for GitHub Pages deployment where the site is hosted on a sub-path.
 */
export function withBasePath(path: string): string {
  if (!path) return path;
  if (!path.startsWith("/")) return path;
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (path.startsWith(basePath)) return path;
  
  return `${basePath}${path}`;
}
