const LOCAL_SITE_ORIGIN = "http://localhost:3000";
const SEPARATE_WEBSITE_HOST = "yorayriniwnl.in";

export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SITE_URL must be set for production metadata and sitemap generation.");
    }
    return LOCAL_SITE_ORIGIN;
  }

  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP(S).");
  }
  const hostname = url.hostname.toLowerCase();
  if (url.username || url.password || !hostname) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a public origin without credentials.");
  }
  if (hostname === SEPARATE_WEBSITE_HOST || hostname.endsWith(`.${SEPARATE_WEBSITE_HOST}`)) {
    throw new Error("NEXT_PUBLIC_SITE_URL cannot use yorayriniwnl.in because it is a separate website.");
  }
  return url.origin;
}

export function absoluteSiteUrl(path: string): string {
  return new URL(path, `${getSiteOrigin()}/`).toString();
}
