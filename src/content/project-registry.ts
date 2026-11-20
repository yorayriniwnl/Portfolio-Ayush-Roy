import { avelryProject } from "./avelry";
import { candidateXProject } from "./candidatex";
import { falseQuietProject } from "./falsequiet";
import { portfolioProject } from "./portfolio-project";
import {
  cvProjects as sharedCvProjects,
  legacyProjects,
  type Project,
} from "./projects";
import { velvetclipProject } from "./velvetclip";

export const CANONICAL_PROJECT_SLUGS = [
  "portfolio",
  "velvetclip",
  "zenith",
  "falsequiet",
  "avelry",
  "candidatex",
] as const;

const zenithProject = sharedCvProjects.find((project) => project.slug === "zenith");
if (!zenithProject) throw new Error("Missing shared CV project zenith");

export const cvProjects: readonly Project[] = [
  portfolioProject,
  velvetclipProject,
  zenithProject,
  falseQuietProject,
  avelryProject,
  candidateXProject,
];

export { legacyProjects };
export const allProjects: readonly Project[] = [...cvProjects, ...legacyProjects];
export const featuredProjects = cvProjects.filter((project) => project.visibility.featured);
const recruiterDisplaySlugs = [
  "candidatex",
  "avelry",
  "zenith",
  "velvetclip",
  "falsequiet",
  "portfolio",
] as const;

export const recruiterProjects: readonly Project[] = recruiterDisplaySlugs.map((slug) => {
  const project = cvProjects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Missing recruiter project ${slug}`);
  return project;
});
