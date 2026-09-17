import type { MetadataRoute } from "next";
import { cvProjects } from "@/content/project-registry";
import { absoluteSiteUrl } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteSiteUrl("/"), priority: 1 },
    { url: absoluteSiteUrl("/resume"), priority: 0.8 },
    { url: absoluteSiteUrl("/lab"), priority: 0.55 },
    { url: absoluteSiteUrl("/projects"), priority: 0.95 },
    ...cvProjects.map((project) => ({
      url: absoluteSiteUrl(`/projects/${project.slug}`),
      priority: 0.85,
    })),
  ];
}
