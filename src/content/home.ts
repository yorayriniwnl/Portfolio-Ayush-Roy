import { recruiterProjects } from "./project-registry";
import type { Project, ProjectMetric } from "./projects";

/**
 * The homepage shows three projects, each with one number a reviewer can
 * check in its case study. Values come from the project registry; captions
 * only restate the context recorded next to each metric.
 */
const HIGHLIGHTS = [
  {
    slug: "candidatex",
    metric: "Paper benchmark",
    caption: "synthetic candidate-role evaluations reported in the submitted paper, across 16 seeds and six target roles",
  },
  {
    slug: "talks",
    metric: "API checks",
    caption: "API checks passing in the repository readiness audit, alongside 17/17 Chromium end-to-end tests. Local runs, not production evidence.",
  },
  {
    slug: "ai-vs-real",
    metric: "Holdout accuracy",
    caption: "accuracy on the repository's 107-image holdout, from 17 handcrafted texture features and an SVM",
  },
] as const;

export type HomeHighlight = {
  project: Project;
  metric: ProjectMetric;
  caption: string;
  source: string | null;
  live: string | null;
};

export const homeHighlights: readonly HomeHighlight[] = HIGHLIGHTS.map(({ slug, metric: label, caption }) => {
  const project = recruiterProjects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Homepage highlight references unknown project ${slug}`);
  const metric = project.metrics.find((candidate) => candidate.label === label);
  if (!metric) throw new Error(`Homepage highlight for ${slug} references missing metric "${label}"`);
  return {
    project,
    metric,
    caption,
    source: project.availability.source === "verified" ? `/projects/${slug}/source` : null,
    live: project.availability.live === "verified" ? `/projects/${slug}/live` : null,
  };
});

/** Tools that appear in the documented projects, in the order they matter most. */
export const coreStack = ["Python", "TypeScript", "FastAPI", "Next.js", "PostgreSQL", "Redis", "WebSockets", "applied ML"] as const;
