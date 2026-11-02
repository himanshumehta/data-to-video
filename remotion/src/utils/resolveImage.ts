import { staticFile } from "remotion";

/**
 * Resolve image URL — if it's a local path (no protocol), use staticFile().
 * Otherwise return the URL as-is.
 */
export function resolveImage(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return staticFile(url);
}
