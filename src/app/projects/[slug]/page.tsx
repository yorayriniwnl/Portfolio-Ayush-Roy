import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/CaseStudy";
import { getProjectMetadata } from "@/content/project-seo";
import { CANONICAL_PROJECT_SLUGS, getCvProject } from "@/content/project-system";

export const dynamicParams = false;

export function generateStaticParams() {
  return CANONICAL_PROJECT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getCvProject((await params).slug);
  return project ? getProjectMetadata(project) : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getCvProject((await params).slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
