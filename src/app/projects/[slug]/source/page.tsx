import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProjectLinkUnavailable } from "@/components/ProjectLinkUnavailable";
import { CANONICAL_PROJECT_SLUGS, getCvProject, resolveProjectLink } from "@/content/project-system";
import { getProjectResolverMetadata } from "@/content/project-seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return CANONICAL_PROJECT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getCvProject((await params).slug);
  return project ? getProjectResolverMetadata(project, "source") : { robots: { index: false, follow: false } };
}

export default async function ProjectSourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const result = resolveProjectLink((await params).slug, "source");
  if (result.kind === "not-found") notFound();
  if (result.kind === "redirect") redirect(result.target);
  return <ProjectLinkUnavailable project={result.project} kind="source" reason={result.reason} />;
}
