import type { Metadata } from "next";
import { ProjectIndex } from "@/components/ProjectIndex";
import { cvProjects, recruiterProjects } from "@/content/project-registry";
import { absoluteSiteUrl } from "@/content/site";

export const metadata: Metadata = {
  title: "Selected Engineering Projects",
  description: `${cvProjects.length} CV projects by Ayush Roy, presented as evidence-backed engineering case studies.`,
  alternates: { canonical: absoluteSiteUrl("/projects") },
  openGraph: {
    title: "Selected Engineering Projects · Ayush Roy",
    description: `${cvProjects.length} CV projects presented as evidence-backed engineering case studies.`,
    url: absoluteSiteUrl("/projects"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Selected Engineering Projects · Ayush Roy",
    description: `${cvProjects.length} CV projects presented as evidence-backed engineering case studies.`,
  },
};

export default function ProjectsPage() {
  return <ProjectIndex projects={recruiterProjects} />;
}
