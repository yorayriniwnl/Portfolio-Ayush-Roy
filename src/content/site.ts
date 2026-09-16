const LOCAL_SITE_ORIGIN = "http://localhost:3000";
const SEPARATE_WEBSITE_HOST = "yorayriniwnl.in";
const PORTFOLIO_VERCEL_PROJECT_ORIGIN = "https://ayush-portfolio-10-release-yorayriniwnl-1218s-projects.vercel.app";

function isSeparateWebsiteOrigin(raw: string): boolean {
  try {
    const hostname = new URL(raw).hostname.toLowerCase();
    return hostname === SEPARATE_WEBSITE_HOST || hostname.endsWith(`.${SEPARATE_WEBSITE_HOST}`);
  } catch {
    return false;
  }
}

export function getSiteOrigin(): string {
  const explicitOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const normalizedVercelOrigin = vercelOrigin
    ? (/^https?:\/\//i.test(vercelOrigin) ? vercelOrigin : `https://${vercelOrigin}`)
    : undefined;
  const verifiedVercelOrigin = normalizedVercelOrigin && !isSeparateWebsiteOrigin(normalizedVercelOrigin)
    ? normalizedVercelOrigin
    : undefined;
  const explicitIsSeparateWebsite = Boolean(explicitOrigin && isSeparateWebsiteOrigin(explicitOrigin));
  const safeVercelOrigin = verifiedVercelOrigin || PORTFOLIO_VERCEL_PROJECT_ORIGIN;
  const raw = explicitIsSeparateWebsite ? safeVercelOrigin : (explicitOrigin || verifiedVercelOrigin);
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL must be set for production metadata and sitemap generation.");
    }
    return LOCAL_SITE_ORIGIN;
  }

  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL must use HTTP(S).");
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
