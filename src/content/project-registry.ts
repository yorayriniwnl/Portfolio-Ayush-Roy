import { candidateXProject } from "./candidatex";
import { portfolioProject } from "./portfolio-project";
import {
  cvProjects as legacyCvProjects,
  legacyProjects,
  type Project,
} from "./projects";

export const CANONICAL_PROJECT_SLUGS = [
  "portfolio",
  "helios",
  "zenith",
  "ai-vs-real",
  "talks",
  "candidatex",
] as const;

const nonPortfolioProjects = legacyCvProjects.filter((project) => project.slug !== "portfolio");

export const cvProjects: readonly Project[] = [
  portfolioProject,
  ...nonPortfolioProjects,
  candidateXProject,
];

export { legacyProjects };
export const allProjects: readonly Project[] = [...cvProjects, ...legacyProjects];
export const featuredProjects = cvProjects.filter((project) => project.visibility.featured);
const recruiterDisplaySlugs = [
  "candidatex",
  "zenith",
  "helios",
  "ai-vs-real",
  "talks",
  "portfolio",
] as const;

export const recruiterProjects: readonly Project[] = recruiterDisplaySlugs.map((slug) => {
  const project = cvProjects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Missing recruiter project ${slug}`);
  return project;
});
