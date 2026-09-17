import { candidateXProject } from "./candidatex";
import {
  cvProjects as originalCvProjects,
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

export const cvProjects: readonly Project[] = [
  ...originalCvProjects,
  candidateXProject,
];

export { legacyProjects };
export const allProjects: readonly Project[] = [...cvProjects, ...legacyProjects];
export const featuredProjects = cvProjects.filter((project) => project.visibility.featured);
