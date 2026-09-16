import type { Metadata } from "next";
import type { Project } from "./projects";
import { projectLinkPath, projectPath, type CanonicalProjectSlug, type ProjectLinkKind } from "./project-system";
import { absoluteSiteUrl } from "./site";

function canonicalSlug(project: Project): CanonicalProjectSlug {
  return project.slug as CanonicalProjectSlug;
}

export function getProjectMetadata(project: Project): Metadata {
  const canonical = absoluteSiteUrl(projectPath(canonicalSlug(project)));
  const image = absoluteSiteUrl(project.seo.ogImage ?? project.art);
  const title = project.seo.title;
  const description = project.seo.description;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "YOR / Ayush Roy",
      images: [{ url: image, width: 1600, height: 900, alt: `${project.title} project artwork` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function getProjectResolverMetadata(project: Project, kind: ProjectLinkKind): Metadata {
  const canonical = absoluteSiteUrl(projectLinkPath(canonicalSlug(project), kind));
  return {
    title: `${project.title} · ${kind === "live" ? "Live resolver" : "Source resolver"}`,
    description: `${kind === "live" ? "Deployment availability" : "Source repository availability"} for ${project.title}.`,
    alternates: { canonical },
    robots: { index: false, follow: false },
  };
}

export function getResumeMetadata(): Metadata {
  const canonical = absoluteSiteUrl("/resume");
  const title = "Resume";
  const description = "Professional overview and selected engineering work by Ayush Roy.";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "profile", siteName: "YOR / Ayush Roy" },
    twitter: { card: "summary", title, description },
  };
}
