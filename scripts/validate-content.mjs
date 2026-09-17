import fs from "node:fs";
import { allProjects, CANONICAL_PROJECT_SLUGS, cvProjects, legacyProjects } from "../src/content/project-registry.ts";
import { claims as claimRegistry } from "../src/content/claims.ts";
import { profile } from "../src/content/profile.ts";

const read = (file) => fs.readFileSync(file, "utf8");
const requiredFiles = [
  "src/content/profile.ts",
  "src/content/projects.ts",
  "src/content/candidatex.ts",
  "src/content/project-registry.ts",
  "src/content/claims.ts",
  "src/content/project-system.ts",
  "src/content/site.ts",
  "src/content/project-seo.ts",
  "src/app/projects/page.tsx",
  "src/app/projects/[slug]/page.tsx",
  "src/app/projects/[slug]/live/page.tsx",
  "src/app/projects/[slug]/source/page.tsx",
  "src/app/resume/page.tsx",
  "src/app/lab/page.tsx",
  "src/app/work/[slug]/page.tsx",
  "src/app/not-found.tsx",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const canonicalSlugs = [...CANONICAL_PROJECT_SLUGS];
const publicSlugs = cvProjects.map((project) => project.slug);
if (JSON.stringify(publicSlugs) !== JSON.stringify(canonicalSlugs)) {
  throw new Error(`CV registry drift: expected ${canonicalSlugs.join(", ")}; received ${publicSlugs.join(", ")}`);
}
if (cvProjects.length !== 6) throw new Error("CV project registry must contain exactly six canonical projects");
if (cvProjects.some((project) => project.slug === "token-usage")) throw new Error("Legacy token project leaked into public registry");
if (legacyProjects.length === 0) throw new Error("Compatibility project registry unexpectedly empty");
if (new Set(allProjects.map((project) => project.slug)).size !== allProjects.length) throw new Error("Project slugs must be unique across public and compatibility registries");
if (new Set(cvProjects.map((project) => project.index)).size !== cvProjects.length) throw new Error("Recruiter-facing project indices must be unique");

const claimIds = new Set(claimRegistry.map((claim) => claim.id));
const projectSlugs = new Set(allProjects.map((project) => project.slug));
for (const claim of claimRegistry) {
  if (!claim.id || !claim.claim || !claim.value || !claim.method || !claim.source || !claim.evidenceUrl) {
    throw new Error(`Incomplete evidence claim ${claim.id || "<unknown>"}`);
  }
  if (!projectSlugs.has(claim.project)) throw new Error(`Claim ${claim.id} references unknown project ${claim.project}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(claim.lastVerified)) throw new Error(`Claim ${claim.id} has invalid verification date`);
  const evidenceUrl = new URL(claim.evidenceUrl);
  if (!["http:", "https:"].includes(evidenceUrl.protocol)) throw new Error(`Claim ${claim.id} uses unsupported evidence protocol`);
}
if (claimIds.size !== claimRegistry.length) throw new Error("Evidence claim IDs must be unique");

for (const project of allProjects) {
  if (!project.title || !project.purpose || !project.role || !project.evidenceScope) throw new Error(`Incomplete project narrative for ${project.slug}`);
  if (!project.seo.title || !project.seo.description) throw new Error(`Missing SEO copy for ${project.slug}`);

  for (const claimId of project.claimIds) {
    if (!claimIds.has(claimId)) throw new Error(`Missing claim reference ${claimId} for ${project.slug}`);
  }

  for (const kind of ["live", "source"]) {
    const status = project.availability[kind];
    const target = project.links[kind];
    if (status === "verified" && !target) throw new Error(`Verified ${kind} link missing for ${project.slug}`);
    if (status !== "verified" && target) throw new Error(`Unverified ${kind} link exposed for ${project.slug}`);
    if (target) {
      const url = new URL(target);
      const host = url.hostname.toLowerCase();
      if (!["http:", "https:"].includes(url.protocol) || !host || host === "localhost" || host.endsWith(".local")) {
        throw new Error(`Unsafe ${kind} link for ${project.slug}`);
      }
    }
  }

  const localAssets = [project.art, ...(project.media ?? []).map((item) => item.src)];
  for (const asset of localAssets) {
    if (!asset.startsWith("/media/")) throw new Error(`Project ${project.slug} exposes non-media local asset ${asset}`);
    if (!fs.existsSync(`public${asset}`)) throw new Error(`Missing project visual ${asset}`);
  }

  for (const media of project.media ?? []) {
    if (!media.alt || !media.caption || !media.label) throw new Error(`Incomplete project media metadata for ${project.slug}: ${media.src}`);
    if (media.width <= 0 || media.height <= 0) throw new Error(`Invalid project media dimensions for ${project.slug}: ${media.src}`);
    const source = new URL(media.sourceUrl);
    if (!["http:", "https:"].includes(source.protocol)) throw new Error(`Invalid media provenance URL for ${project.slug}: ${media.src}`);
  }
}

const candidateX = cvProjects.find((project) => project.slug === "candidatex");
if (!candidateX) throw new Error("CandidateX missing from recruiter-facing registry");
if (candidateX.availability.live !== "verified" || candidateX.links.live !== "https://candidatex-smoky.vercel.app") {
  throw new Error("CandidateX public frontend demo mapping drifted");
}
if (candidateX.media.length < 4 || !candidateX.art.includes("/candidatex/")) throw new Error("CandidateX bespoke visual system missing");
const candidateMetric = (label) => candidateX.metrics.find((metric) => metric.label === label)?.value;
if (candidateMetric("Paper benchmark") !== "28,800") throw new Error("CandidateX paper benchmark provenance drifted");
if (candidateMetric("Supplementary ablation") !== "4,800") throw new Error("CandidateX supplementary ablation provenance drifted");
if (!candidateX.limitations.some((item) => /real-world hiring/i.test(item))) throw new Error("CandidateX real-world validation boundary missing");

const detector = cvProjects.find((project) => project.slug === "ai-vs-real");
const detectorClaim = claimRegistry.find((claim) => claim.id === "texture-holdout-accuracy" && claim.project === "ai-vs-real");
const detectorMetric = detector?.metrics.find((metric) => metric.label === "Holdout accuracy");
if (
  !detectorClaim ||
  detectorClaim.value !== "78.5" ||
  !/107-image holdout/i.test(detectorClaim.unit) ||
  detectorMetric?.value.replace(/%$/, "") !== detectorClaim.value ||
  !/107-image holdout/i.test(detectorMetric.context)
) {
  throw new Error("AI vs. Real holdout evidence boundary missing");
}
const talks = cvProjects.find((project) => project.slug === "talks");
if (talks?.availability.live !== "blocked") throw new Error("Talks readiness boundary missing");
if (!talks?.technologies.includes("Socket.IO") || !talks.technologies.includes("Redis")) throw new Error("Current Talks stack missing");
const zenith = cvProjects.find((project) => project.slug === "zenith");
if (!zenith?.collaborators?.includes("Nivedana")) throw new Error("Zenith collaborator attribution missing");

if (profile.headline !== "Product / Full-Stack Engineer") throw new Error("Primary positioning missing");
if (!read("src/content/site.ts").includes("NEXT_PUBLIC_SITE_URL")) throw new Error("Deployment origin configuration missing");

const publicSurfaceFiles = [
  "src/app/projects/page.tsx",
  "src/components/ProjectIndex.tsx",
  "src/components/Home.tsx",
  "src/components/Lab.tsx",
  "src/app/resume/page.tsx",
  "src/components/SiteNav.tsx",
];
for (const file of publicSurfaceFiles) {
  const source = read(file);
  if (source.includes("/work/")) throw new Error(`Legacy /work URL leaked into ${file}`);
  if (source.includes("token-usage")) throw new Error(`Legacy token project leaked into ${file}`);
}

console.log("content validation: passed");
