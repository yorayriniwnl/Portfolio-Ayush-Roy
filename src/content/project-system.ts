import { cvProjects, legacyProjects, type Project } from "./projects";

export { CANONICAL_PROJECT_SLUGS, cvProjects, legacyProjects } from "./projects";
import { CANONICAL_PROJECT_SLUGS } from "./projects";

export type CanonicalProjectSlug = (typeof CANONICAL_PROJECT_SLUGS)[number];
export type ProjectLinkKind = "live" | "source";

export type ProjectLinkResolution =
  | { kind: "redirect"; project: Project; target: string }
  | { kind: "unavailable"; project: Project; reason: string }
  | { kind: "not-found"; reason: string };

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function matches(project: Project, input: string) {
  const key = normalize(input);
  return project.slug === key || project.aliases.some((alias) => alias === key);
}

export function getCanonicalProjectSlug(input: string): CanonicalProjectSlug | undefined {
  const project = cvProjects.find((candidate) => matches(candidate, input));
  return project?.slug as CanonicalProjectSlug | undefined;
}

export function getCvProject(input: string): Project | undefined {
  return cvProjects.find((project) => matches(project, input));
}

export function getLegacyProject(slug: string): Project | undefined {
  return legacyProjects.find((project) => matches(project, slug));
}

export function getLegacyRedirect(input: string): string | undefined {
  const project = getCvProject(input);
  return project ? projectPath(project.slug as CanonicalProjectSlug) : undefined;
}

function safeExternalTarget(target: string | undefined): string | undefined {
  if (!target) return undefined;

  try {
    const url = new URL(target);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    const isLoopback =
      hostname === "localhost" ||
      hostname === "::1" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local") ||
      /^127\.(?:\d{1,3}\.){2}\d{1,3}$/.test(hostname) ||
      /^10\.(?:\d{1,3}\.){2}\d{1,3}$/.test(hostname) ||
      /^192\.168\.(?:\d{1,3}\.)\d{1,3}$/.test(hostname) ||
      /^172\.(?:1[6-9]|2\d|3[0-1])\.(?:\d{1,3}\.)\d{1,3}$/.test(hostname);

    if (!(["http:", "https:"] as readonly string[]).includes(url.protocol) || isLoopback) {
      return undefined;
    }

    return target.trim();
  } catch {
    return undefined;
  }
}

function unavailableReason(project: Project, kind: ProjectLinkKind) {
  if (kind === "live" && project.availability.live === "blocked") {
    return "A public deployment is currently blocked by the project's release gates.";
  }
  if (kind === "live") {
    return "A verified public deployment is not configured for this project yet.";
  }
  return "A verified source repository is not configured for this project yet.";
}

export function resolveConfiguredProjectLink(project: Project, kind: ProjectLinkKind): ProjectLinkResolution {
  const target = safeExternalTarget(project.links[kind]);
  if (project.availability[kind] !== "verified" || !target) {
    return { kind: "unavailable", project, reason: unavailableReason(project, kind) };
  }
  return { kind: "redirect", project, target };
}

export function resolveProjectLink(input: string, kind: ProjectLinkKind): ProjectLinkResolution {
  const project = getCvProject(input);
  if (!project) return { kind: "not-found", reason: `Unknown project: ${input}` };
  return resolveConfiguredProjectLink(project, kind);
}

export function projectPath(slug: CanonicalProjectSlug) {
  return `/projects/${slug}`;
}

export function projectLinkPath(slug: CanonicalProjectSlug, kind: ProjectLinkKind) {
  return `${projectPath(slug)}/${kind}`;
}
