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

const currentOriginalCvProjects: readonly Project[] = originalCvProjects.map((project) => {
  if (project.slug !== "portfolio") return project;

  return {
    ...project,
    decisions: project.decisions.map((decision, index) =>
      index === 0
        ? { ...decision, body: decision.body.replace("five public projects", "six public projects") }
        : decision,
    ),
    results: project.results.map((result) =>
      result.replace("exactly five CV projects", "exactly six CV projects"),
    ),
    metrics: project.metrics.map((metric) =>
      metric.label === "Public project scope" ? { ...metric, value: "6" } : metric,
    ),
  };
});

export const cvProjects: readonly Project[] = [
  ...currentOriginalCvProjects,
  candidateXProject,
];

export { legacyProjects };
export const allProjects: readonly Project[] = [...cvProjects, ...legacyProjects];
export const featuredProjects = cvProjects.filter((project) => project.visibility.featured);
