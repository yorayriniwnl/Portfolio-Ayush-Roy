import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
