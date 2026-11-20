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
    slug: "avelry",
    metric: "API tests",
    caption: "API tests passing in Avelry's 4 Nov 2026 web-release review, alongside 345 Chromium end-to-end tests. One reviewed build, not uptime evidence.",
  },
  {
    slug: "velvetclip",
    metric: "Browser tools",
    caption: "PDF, image, document, and media tools that process files on the user's device instead of uploading them",
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
