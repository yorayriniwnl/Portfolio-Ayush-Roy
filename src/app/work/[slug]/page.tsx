import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CaseStudy } from "@/components/CaseStudy";
import { getProjectMetadata } from "@/content/project-seo";
import { cvProjects, legacyProjects } from "@/content/projects";
import { getCvProject, getLegacyProject, getLegacyRedirect } from "@/content/project-system";
import { absoluteSiteUrl } from "@/content/site";

export function generateStaticParams() {
  return [...cvProjects, ...legacyProjects].flatMap((project) => [project.slug, ...project.aliases]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const project = getCvProject(slug);
  if (project) return getProjectMetadata(project);
  const legacy = getLegacyProject(slug);
  return legacy
    ? { title: legacy.title, alternates: { canonical: absoluteSiteUrl(`/work/${legacy.slug}`) }, robots: { index: false, follow: false } }
    : {};
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const canonical = getLegacyRedirect(slug);
  if (canonical) permanentRedirect(canonical);

  const legacy = getLegacyProject(slug);
  if (!legacy) notFound();
  return <CaseStudy project={legacy} />;
}
