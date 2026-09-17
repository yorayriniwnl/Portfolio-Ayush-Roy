import fs from "node:fs";
import { allProjects, CANONICAL_PROJECT_SLUGS, cvProjects, legacyProjects } from "../src/content/project-registry.ts";
import { claims as claimRegistry } from "../src/content/claims.ts";

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
  "src/app/work/[slug]/page.tsx",
  "src/app/not-found.tsx",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const content = read("src/content/projects.ts");
const candidateContent = read("src/content/candidatex.ts");
const claimsSource = read("src/content/claims.ts");
const canonicalSlugs = ["portfolio", "helios", "zenith", "ai-vs-real", "talks", "candidatex"];

if (JSON.stringify([...CANONICAL_PROJECT_SLUGS]) !== JSON.stringify(canonicalSlugs)) {
  throw new Error("Canonical project order is missing or incomplete");
}
if (cvProjects.length !== canonicalSlugs.length || JSON.stringify(cvProjects.map((project) => project.slug)) !== JSON.stringify(canonicalSlugs)) {
  throw new Error("CV project registry must contain exactly the six canonical projects");
}
if (cvProjects.some((project) => project.slug === "token-usage")) {
  throw new Error("Legacy token project leaked into public registry");
}
if (!read("src/content/project-registry.ts").includes("candidateXProject") || legacyProjects.length === 0) {
  throw new Error("Project registry visibility boundary missing");
}
if (new Set(allProjects.map((project) => project.slug)).size !== allProjects.length) {
  throw new Error("Project slugs must be unique across public and compatibility registries");
}

const claimIds = new Set(claimRegistry.map((claim) => claim.id));
for (const project of allProjects) {
  for (const claimId of project.claimIds) {
    if (!claimIds.has(claimId)) throw new Error(`Missing claim reference ${claimId} for ${project.slug}`);
  }

  for (const kind of ["live", "source"]) {
    const status = project.availability[kind];
    const target = project.links[kind];
    if (status === "verified" && !target) throw new Error(`Verified ${kind} link missing for ${project.slug}`);
    if (status !== "verified" && target) throw new Error(`Unverified ${kind} link exposed for ${project.slug}`);
    if (target) {
      let url;
      try {
        url = new URL(target);
      } catch {
        throw new Error(`Malformed ${kind} link for ${project.slug}`);
      }
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.hostname === "localhost" || url.hostname.endsWith(".local")) {
        throw new Error(`Unsafe ${kind} link for ${project.slug}`);
      }
    }
  }
}

for (const id of [
  "portfolio-system",
  "talks-realtime-stack",
  "talks-release-boundary",
  "helios-deterministic-demo",
  "texture-holdout-accuracy",
  "zenith-interface-attribution",
  "token-usage-estimates",
]) {
  if (!claimsSource.includes(`id: "${id}"`)) throw new Error(`Missing claim ${id}`);
}

if (!content.includes("78.5% accuracy on the repository's specific 107-image holdout")) throw new Error("AI vs. Real metric boundary missing");
if (!content.includes("deployment blocked")) throw new Error("Talks readiness boundary missing");
if (!content.includes("Nivedana: architecture and full-stack development")) throw new Error("Zenith collaborator attribution missing");
if (!content.includes('"React", "Vite", "Express 5", "Socket.IO", "PostgreSQL", "Drizzle", "Redis"')) throw new Error("Current Talks stack missing");
if (!candidateContent.includes("https://github.com/yorayriniwnl/CandidateX")) throw new Error("CandidateX source mapping missing");
if (!candidateContent.includes('availability: { live: "unavailable", source: "verified" }')) throw new Error("CandidateX live evidence boundary missing");
if (!read("src/content/site.ts").includes("NEXT_PUBLIC_SITE_URL")) throw new Error("Deployment origin configuration missing");

if (!read("src/content/profile.ts").includes('headline: "Product / Full-Stack Engineer"')) throw new Error("Primary positioning missing");

for (const asset of [
  "/media/github/yor-talks/hero.svg", "/media/github/yor-talks/architecture.svg",
  "/media/github/yor-helios/hero.svg", "/media/github/yor-helios/architecture.svg", "/media/github/yor-helios/dashboard.svg", "/media/github/yor-helios/alerts.svg", "/media/github/yor-helios/alert-detail.svg", "/media/github/yor-helios/mobile-evidence.svg",
  "/media/github/texture-forensics/hero.svg", "/media/github/texture-forensics/architecture.svg",
  "/media/github/yor-zenith/hero.svg", "/media/github/yor-zenith/architecture.svg",
]) {
  if (!fs.existsSync(`public${asset}`)) throw new Error(`Missing repository visual ${asset}`);
}

for (const marker of [
  "Source visuals / repository assets",
  "View source asset ↗",
  "3aad91ce46059bb47749a0d5598140cd8cb91099",
  "a99e15056eadb5252bf299c62e8af5844d543d4c",
  "42db86fbc1ddef360fba0366b49f18039b6dc4e9",
  "58b2a256aa56c1eff202ef39ef5c7fa73bc2dea1",
]) {
  if (!read("src/components/ProjectGallery.tsx").includes(marker) && !content.includes(marker)) {
    throw new Error(`Repository visual marker missing ${marker}`);
  }
}

const publicSurfaceFiles = [
  "src/app/projects/page.tsx",
  "src/components/ProjectIndex.tsx",
  "src/components/Universe.tsx",
  "src/components/Home.tsx",
  "src/app/resume/page.tsx",
  "src/components/SiteNav.tsx",
];
for (const file of publicSurfaceFiles) {
  const source = read(file);
  if (source.includes("/work/")) throw new Error(`Legacy /work URL leaked into ${file}`);
  if (source.includes("token-usage")) throw new Error(`Legacy token project leaked into ${file}`);
}

console.log("content validation: passed");
