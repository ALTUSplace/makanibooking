const UNSPLASH_HOST = "images.unsplash.com";

function setParam(url: URL, key: string, value: string) {
  url.searchParams.set(key, value);
}

/**
 * Optimizes supported remote images without breaking user-uploaded or data URLs.
 * Unsplash's `auto=format` negotiates AVIF/WebP from the browser Accept header.
 * Other hosts are preserved because arbitrary transformations may invalidate URLs.
 */
export function optimizeImageUrl(
  source: string | null | undefined,
  options: { width?: number; quality?: number; fit?: "crop" | "clip" | "max" } = {},
): string | undefined {
  if (!source) return undefined;
  if (source.startsWith("data:") || source.startsWith("blob:")) return source;

  try {
    const url = new URL(source, window.location.origin);
    if (url.hostname !== UNSPLASH_HOST) return source;

    setParam(url, "auto", "format");
    setParam(url, "fit", options.fit ?? "crop");
    setParam(url, "q", String(options.quality ?? 76));
    if (options.width) setParam(url, "w", String(options.width));

    return url.toString();
  } catch {
    return source;
  }
}

export function imageSrcSet(source: string | null | undefined, widths = [320, 640, 960, 1280]) {
  if (!source || !source.includes(UNSPLASH_HOST)) return undefined;
  return widths
    .map((width) => `${optimizeImageUrl(source, { width })} ${width}w`)
    .join(", ");
}

export const imageSizes = {
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  hero: "(max-width: 768px) 100vw, 50vw",
  thumb: "96px",
} as const;
