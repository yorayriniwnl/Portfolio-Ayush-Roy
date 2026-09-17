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

const canonicalProjectCount = originalCvProjects.length + 1;

const normalizedOriginalProjects: readonly Project[] = originalCvProjects.map((project) => {
  if (project.slug !== "portfolio") return project;

  return {
    ...project,
    decisions: project.decisions.map((decision, index) =>
      index === 0
        ? { ...decision, body: `The ${canonicalProjectCount} public projects, aliases, links, availability, claims, and SEO copy live in the content model rather than being repeated across route components.` }
        : decision,
    ),
    results: project.results.map((result, index) =>
      index === 0 ? `The public project index exposes exactly ${canonicalProjectCount} CV projects.` : result,
    ),
    metrics: project.metrics.map((metric) =>
      metric.label === "Public project scope" ? { ...metric, value: String(canonicalProjectCount) } : metric,
    ),
  };
});

export const cvProjects: readonly Project[] = [
  ...normalizedOriginalProjects,
  candidateXProject,
];

export { legacyProjects };
export const allProjects: readonly Project[] = [...cvProjects, ...legacyProjects];
export const featuredProjects = cvProjects.filter((project) => project.visibility.featured);
const recruiterDisplaySlugs = [
  "candidatex",
  "helios",
  "portfolio",
  "zenith",
  "ai-vs-real",
  "talks",
] as const;

export const recruiterProjects: readonly Project[] = recruiterDisplaySlugs.map((slug) => {
  const project = cvProjects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Missing recruiter project ${slug}`);
  return project;
});
