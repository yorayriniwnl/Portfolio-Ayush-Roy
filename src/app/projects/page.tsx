import type { Metadata } from "next";
import { ProjectIndex } from "@/components/ProjectIndex";
import { cvProjects } from "@/content/projects";
import { absoluteSiteUrl } from "@/content/site";

export const metadata: Metadata = {
  title: "Selected Engineering Projects",
  description: "Six CV projects by Ayush Roy, presented as evidence-backed engineering case studies.",
  alternates: { canonical: absoluteSiteUrl("/projects") },
  openGraph: {
    title: "Selected Engineering Projects · Ayush Roy",
    description: "Six CV projects presented as evidence-backed engineering case studies.",
    url: absoluteSiteUrl("/projects"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Selected Engineering Projects · Ayush Roy",
    description: "Six CV projects presented as evidence-backed engineering case studies.",
  },
};

export default function ProjectsPage() {
  return <ProjectIndex projects={cvProjects} />;
}
