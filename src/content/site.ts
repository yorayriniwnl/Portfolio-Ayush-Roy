const LOCAL_SITE_ORIGIN = "http://localhost:3000";
const DEFAULT_SITE_ORIGIN = "https://yorayriniwnl.in";

function normalizeOrigin(raw: string): string {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL must use HTTP(S).");
  }
  if (url.username || url.password || !url.hostname) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public origin without credentials.");
  }
  return url.origin;
}

export function getSiteOrigin(): string {
  const explicitOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const normalizedVercelOrigin = vercelOrigin
    ? (/^https?:\/\//i.test(vercelOrigin) ? vercelOrigin : `https://${vercelOrigin}`)
    : undefined;
  const raw = explicitOrigin || (process.env.VERCEL === "1" ? DEFAULT_SITE_ORIGIN : normalizedVercelOrigin);
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL must be set for production metadata and sitemap generation.");
    }
    return LOCAL_SITE_ORIGIN;
  }

  return normalizeOrigin(raw);
}

export function absoluteSiteUrl(path: string): string {
  return new URL(path, `${getSiteOrigin()}/`).toString();
}
