# Recruiter-Facing Project System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a truthful, recruiter-facing `/projects` system for exactly five CV projects, with canonical case studies, stable live/source resolvers, legacy `/work` redirects, and evidence-backed SEO.

**Architecture:** Keep the existing project-content architecture, but split the registry into `cvProjects` and compatibility-only `legacyProjects`. Central pure helpers will canonicalize aliases, resolve link availability, generate public paths, and provide metadata inputs; server route pages will redirect or render unavailable states without proxying external applications.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, existing YOR CSS/design tokens, Node test runner through `tsx`, existing Next/ESLint/typecheck/build tooling.

**Spec:** `docs/superpowers/specs/2026-09-16-recruiter-facing-project-system-design.md`

## Global Constraints

- Public CV project slugs are exactly `portfolio`, `helios`, `zenith`, `ai-vs-real`, and `talks`.
- `yorayriniwnl.in` is the intended custom-domain host for this repository; the existing homepage remains intact while the five project routes live beneath `/projects`.
- `NEXT_PUBLIC_SITE_URL` identifies `https://yorayriniwnl.in` in deployment; local fallback is `http://localhost:3000`, and non-Vercel production builds fail clearly when no origin is available.
- `/live` redirects only to an explicitly verified HTTP(S) deployment; unavailable projects render an honest state.
- `/source` redirects to the repository through the stable portfolio namespace; the public route is never named `/github`.
- External applications are never embedded, proxied, or served through the portfolio deployment.
- `/work/helios`, `/work/zenith`, `/work/texture-forensics`, and `/work/yor-talks` permanently redirect to their canonical `/projects` pages, with sensible branded aliases preserved.
- The unrelated `token-usage` record remains compatibility-only and never appears in `/projects`, recruiter navigation, the resume selected-work list, the sitemap, or new case-study navigation.
- No technical claim, deployment, ownership statement, screenshot, metric, or production-readiness label may exceed repository evidence.
- Yor Talks is described as React/Vite + Express/Socket.IO + PostgreSQL/Drizzle + Redis, with deployment blocked/unverified; stale Next.js/FastAPI wording is removed.
- AI-vs-Real accuracy is described only as 78.5% on the specific 107-image holdout from the repository evaluation, never as universal detector accuracy.
- Zenith retains the repository attribution that credits Nivedana with architecture/full-stack development and Ayush with interface direction/product experience.
- Helios sample telemetry remains explicitly deterministic/illustrative; no unmeasured latency or field-telemetry claim is added.
- The `/projects` index and textual case studies remain server-rendered; the existing R3F/Three demo is loaded only below the fold when reached.
- No new heavy analytics, CMS, visual redesign, fake charts, invasive tracking, or unrelated repository changes are introduced.

---

## File map

| File | Responsibility after implementation |
| --- | --- |
| `src/content/projects.ts` | Central project records, `cvProjects`, `legacyProjects`, media, evidence, claims, links, availability, visibility, and SEO copy |
| `src/content/project-system.ts` | Pure canonical lookup, alias lookup, public path generation, legacy redirects, and live/source resolution |
| `src/content/site.ts` | Validated `NEXT_PUBLIC_SITE_URL` origin and absolute URL helpers |
| `src/content/project-seo.ts` | Project metadata/canonical/Open Graph/Twitter object generation |
| `src/content/claims.ts` | Evidence claims keyed to canonical project identifiers; legacy token claim retained separately |
| `src/components/ProjectIndex.tsx` | Five-project recruiter index and project cards |
| `src/components/ProjectLinkUnavailable.tsx` | Honest unavailable-live/source state with recovery links |
| `src/components/DeferredProjectDemo.tsx` | Client-only, intersection-triggered loading boundary for the existing 3D demo |
| `src/components/CaseStudy.tsx` | Reusable above-fold hero, CTAs, anchors, contribution/evidence sections, media, and CV-only case navigation |
| `src/components/ProjectDemo.tsx` | Existing interactive explanation with canonical project modes only; no token-usage mode |
| `src/components/Universe.tsx` / `src/components/Home.tsx` | Existing homepage project surfaces limited to `cvProjects` and canonical internal links |
| `src/components/SiteNav.tsx` | Human-facing `Work` navigation entry targeting `/projects` |
| `src/app/projects/page.tsx` | Server-rendered selected-project index |
| `src/app/projects/[slug]/page.tsx` | Canonical case-study route, static params, 404 behavior, and metadata |
| `src/app/projects/[slug]/live/page.tsx` | Data-driven live redirect or unavailable state |
| `src/app/projects/[slug]/source/page.tsx` | Data-driven source redirect or unavailable state |
| `src/app/work/[slug]/page.tsx` | Permanent legacy redirects plus compatibility-only legacy record handling |
| `src/app/layout.tsx` | Configured metadata base and schema URL |
| `src/app/sitemap.ts` / `src/app/robots.ts` | Configured-origin SEO files containing only canonical public routes |
| `src/app/resume/page.tsx` | Five CV project links through canonical routes |
| `src/app/not-found.tsx` | Project-index recovery link |
| `src/styles/tokens.css` / `src/app/globals.css` | Targeted index, hero CTA, evidence, unavailable-state, anchor, and mobile styling |
| `scripts/validate-content.mjs` | Static content/route/scope guardrails |
| `README.md` | Correct `/projects` architecture and deployment-origin documentation |
| `package.json` / `package-lock.json` | Test script, `tsx` runner, and synchronized dependency graph |
| `tests/*.test.ts` | Resolver, registry visibility, metadata, sitemap, and rendered index behavior |

---

### Task 1: Establish the test harness and red project-system tests

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tests/project-system.test.ts`

**Interfaces:**

- The tests expect `CANONICAL_PROJECT_SLUGS`, `cvProjects`, `getCanonicalProjectSlug`, `getCvProject`, `getLegacyRedirect`, `resolveProjectLink`, and `resolveConfiguredProjectLink` to be exported from `src/content/project-system.ts`.

- [ ] **Step 1: Add the smallest TypeScript test command and runner dependency**

Add this script to `package.json`:

~~~json
"test": "tsx --test tests/*.test.ts"
~~~

Add `tsx` to `devDependencies`, then run:

~~~bash
npm install
npm ci
~~~

`npm ci` must succeed after the lockfile is synchronized; this repairs the pre-existing `picomatch` lock drift.

- [ ] **Step 2: Write the failing registry/resolver tests**

Create `tests/project-system.test.ts` with real assertions against the desired public behavior:

~~~ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  CANONICAL_PROJECT_SLUGS,
  cvProjects,
  getCanonicalProjectSlug,
  getCvProject,
  getLegacyRedirect,
  resolveConfiguredProjectLink,
  resolveProjectLink,
} from "../src/content/project-system";

test("exposes exactly the five CV project slugs", () => {
  assert.deepEqual([...CANONICAL_PROJECT_SLUGS], ["portfolio", "helios", "zenith", "ai-vs-real", "talks"]);
  assert.deepEqual(cvProjects.map((project) => project.slug), [...CANONICAL_PROJECT_SLUGS]);
  assert.equal(cvProjects.some((project) => project.slug === "token-usage"), false);
});

test("canonicalizes historical project aliases", () => {
  assert.equal(getCanonicalProjectSlug("texture-forensics"), "ai-vs-real");
  assert.equal(getCanonicalProjectSlug("yor-talks"), "talks");
  assert.equal(getCvProject("yor-helios")?.slug, "helios");
  assert.equal(getCanonicalProjectSlug("token-usage"), undefined);
});

test("maps legacy work paths to canonical project paths", () => {
  assert.equal(getLegacyRedirect("helios"), "/projects/helios");
  assert.equal(getLegacyRedirect("texture-forensics"), "/projects/ai-vs-real");
  assert.equal(getLegacyRedirect("yor-talks"), "/projects/talks");
  assert.equal(getLegacyRedirect("not-a-project"), undefined);
});

test("resolves the verified Zenith live target", () => {
  const result = resolveProjectLink("zenith", "live");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://zenith-xi-snowy.vercel.app");
});

test("keeps the portfolio live route unavailable without a distinct deployment", () => {
  const result = resolveProjectLink("portfolio", "live");
  assert.equal(result.kind, "unavailable");
  assert.equal(getCvProject("portfolio")?.links.live, undefined);
});

test("keeps Yor Talks live unavailable", () => {
  assert.equal(resolveProjectLink("talks", "live").kind, "unavailable");
});

test("resolves source through the stable source namespace", () => {
  const result = resolveProjectLink("talks", "source");
  assert.equal(result.kind, "redirect");
  if (result.kind === "redirect") assert.equal(result.target, "https://github.com/yorayriniwnl/yor-talksv2");
});

test("rejects malformed configured redirect data", () => {
  const project = getCvProject("zenith");
  assert.ok(project);
  const broken = {
    ...project,
    links: { ...project.links, live: "http://localhost:3000" },
    availability: { ...project.availability, live: "verified" as const },
  };
  assert.equal(resolveConfiguredProjectLink(broken, "live").kind, "unavailable");
});

test("returns not-found for an unknown project link", () => {
  assert.equal(resolveProjectLink("missing", "source").kind, "not-found");
});
~~~

- [ ] **Step 3: Run the red test and verify the failure is about the missing feature**

Run:

~~~bash
npx tsx --test tests/project-system.test.ts
~~~

Expected: FAIL because `src/content/project-system.ts` and its exported contract do not exist yet. Fix only test/setup errors if present; do not add production implementation in this step.

- [ ] **Step 4: Commit the red test harness**

~~~bash
git add package.json package-lock.json tests/project-system.test.ts
git commit -m "test: define project registry and resolver contract"
~~~

### Task 2: Build the canonical registry and migrate claims/consumers

**Files:**

- Modify: `src/content/projects.ts`
- Create: `src/content/project-system.ts`
- Modify: `src/content/claims.ts`
- Modify: `src/components/Universe.tsx`
- Modify: `src/components/Home.tsx`
- Modify: `src/components/CaseStudy.tsx`
- Modify: `src/app/resume/page.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/work/[slug]/page.tsx`
- Test: `tests/project-system.test.ts`

**Interfaces:**

- `cvProjects` is the only registry consumed by recruiter-facing surfaces.
- `legacyProjects` contains the existing token-usage record.
- `allProjects` is available only to compatibility code.
- `getCanonicalProjectSlug(input: string): CanonicalProjectSlug | undefined` resolves canonical slugs and aliases.
- `resolveProjectLink(input: string, kind: "live" | "source"): ProjectLinkResolution` returns `redirect`, `unavailable`, or `not-found`.

- [ ] **Step 1: Implement the minimal data fields required by the red tests**

Update the `Project` model with `id`, `aliases`, `links`, `availability`, `visibility`, `metrics`, `implementation`, `testing`, `results`, `demoMode`, and `seo`, while preserving the existing prose/media fields. Replace the old `repo`/`featured` consumers with `links.source`/`visibility.featured` in the same migration.

Use these public link states:

| Slug | Live link/status | Source link/status |
| --- | --- | --- |
| `portfolio` | no link / unavailable at initial audit | `https://github.com/yorayriniwnl/Portfolio-Ayush-Roy` / verified |
| `helios` | no link / unavailable at initial audit | `https://github.com/yorayriniwnl/Yor-Helios` / verified |
| `zenith` | `https://zenith-xi-snowy.vercel.app` / verified-reachable, not production-ready | `https://github.com/yorayriniwnl/Yor-Zenith` / verified |
| `ai-vs-real` | no link / unavailable at initial audit | `https://github.com/yorayriniwnl/Yor-Ai-vs-real-image` / verified |
| `talks` | no link / unavailable | `https://github.com/yorayriniwnl/yor-talksv2` / verified |

Set the canonical order and titles to:

~~~ts
const canonicalSlugs = ["portfolio", "helios", "zenith", "ai-vs-real", "talks"] as const;
~~~

Use `Yor AI vs. Real Image Detector` as the public AI project title with `Texture Forensics` retained in its technical kicker. Use `Yor Talks V2` as the public Talks title.

- [ ] **Step 2: Move the unrelated token record into the legacy collection**

Keep its content and claim intact, but make its visibility explicit:

~~~ts
export const cvProjects: readonly Project[] = [portfolio, helios, zenith, aiVsReal, talks];
export const legacyProjects: readonly Project[] = [tokenUsage];
export const allProjects: readonly Project[] = [...cvProjects, ...legacyProjects];
~~~

Export `featuredProjects` from `cvProjects` only. Update every user-facing map, count, case-study next link, resume entry, and sitemap map to consume `cvProjects`; reserve `allProjects` for the legacy route.

- [ ] **Step 3: Implement the pure lookup and link resolver**

Create `src/content/project-system.ts` with this contract:

~~~ts
import { cvProjects, legacyProjects, type Project } from "./projects";

export const CANONICAL_PROJECT_SLUGS = ["portfolio", "helios", "zenith", "ai-vs-real", "talks"] as const;
export type CanonicalProjectSlug = (typeof CANONICAL_PROJECT_SLUGS)[number];
export type ProjectLinkKind = "live" | "source";
export type ProjectLinkResolution =
  | { kind: "redirect"; project: Project; target: string }
  | { kind: "unavailable"; project: Project; reason: string }
  | { kind: "not-found"; reason: string };

export function getCanonicalProjectSlug(input: string): CanonicalProjectSlug | undefined;
export function getCvProject(input: string): Project | undefined;
export function getLegacyProject(slug: string): Project | undefined;
export function getLegacyRedirect(input: string): string | undefined;
export function resolveProjectLink(input: string, kind: ProjectLinkKind): ProjectLinkResolution;
export function resolveConfiguredProjectLink(project: Project, kind: ProjectLinkKind): ProjectLinkResolution;
export function projectPath(slug: CanonicalProjectSlug): string;
export function projectLinkPath(slug: CanonicalProjectSlug, kind: ProjectLinkKind): string;
~~~

Validate target URLs with `new URL`, allow only `http:`/`https:`, and reject localhost/loopback hosts. A missing target or non-verified availability always returns `unavailable`.

- [ ] **Step 4: Migrate claim identifiers without deleting legacy evidence**

Change the five public claim records from `yor-talks` to `talks` and from `texture-forensics` to `ai-vs-real`. Keep `token-usage-estimates` attached to the legacy token record. Preserve evidence URLs and bounded claim wording.

- [ ] **Step 5: Run the focused tests and typecheck**

Run:

~~~bash
npx tsx --test tests/project-system.test.ts
npm run typecheck
~~~

Expected: all project-system tests pass, and no old `repo`/`featured` type errors remain in existing consumers.

- [ ] **Step 6: Commit the registry migration**

~~~bash
git add src/content/projects.ts src/content/project-system.ts src/content/claims.ts src/components/Universe.tsx src/components/Home.tsx src/components/CaseStudy.tsx src/app/resume/page.tsx src/app/sitemap.ts src/app/work/[slug]/page.tsx tests/project-system.test.ts
git commit -m "feat: establish canonical CV project registry"
~~~

### Task 3: Add configurable site-origin and metadata tests

**Files:**

- Create: `src/content/site.ts`
- Create: `src/content/project-seo.ts`
- Create: `tests/project-seo.test.ts`
- Create: `tests/sitemap.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/robots.ts`

**Interfaces:**

- `getSiteOrigin(): string` returns the configured origin or local fallback.
- `absoluteSiteUrl(path: string): string` returns an absolute URL from the configured origin.
- `getProjectMetadata(project: Project): Metadata` returns canonical/Open Graph/Twitter metadata.

- [ ] **Step 1: Write failing metadata and sitemap tests**

Create tests that set `process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test"` and assert:

~~~ts
test("generates an absolute canonical project URL from the configured origin", () => {
  const metadata = getProjectMetadata(getCvProject("helios")!);
  assert.equal(metadata.alternates?.canonical, "https://portfolio.example.test/projects/helios");
  assert.equal((metadata.openGraph as { url?: string }).url, "https://portfolio.example.test/projects/helios");
  assert.equal((metadata.twitter as { card?: string }).card, "summary_large_image");
});

test("sitemap contains only the recruiter-facing canonical routes", async () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.ok(urls.includes("https://portfolio.example.test/projects"));
  for (const slug of ["portfolio", "helios", "zenith", "ai-vs-real", "talks"]) {
    assert.ok(urls.includes("https://portfolio.example.test/projects/" + slug));
  }
  assert.equal(urls.some((url) => url.includes("/work/")), false);
  assert.equal(urls.some((url) => url.includes("token-usage")), false);
  assert.equal(urls.some((url) => url.endsWith("/live") || url.endsWith("/source")), false);
});
~~~

- [ ] **Step 2: Run the red metadata tests**

~~~bash
npx tsx --test tests/project-seo.test.ts tests/sitemap.test.ts
~~~

Expected: FAIL because the site-origin/SEO helpers and new sitemap contract are not implemented.

- [ ] **Step 3: Implement origin validation**

Create `src/content/site.ts`:

~~~ts
const LOCAL_SITE_ORIGIN = "http://localhost:3000";

export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SITE_URL must be set for production metadata and sitemap generation.");
    }
    return LOCAL_SITE_ORIGIN;
  }
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP(S).");
  return url.origin;
}

export function absoluteSiteUrl(path: string): string {
  return new URL(path, getSiteOrigin() + "/").toString();
}
~~~

Set this variable to `https://yorayriniwnl.in` in the linked Vercel project's deployment environment.

- [ ] **Step 4: Implement project metadata and canonical sitemap data**

Generate `title`, `description`, `alternates.canonical`, `openGraph.url`, `openGraph.images`, `twitter.card`, and Twitter images from each project’s `seo` record and `art` fallback. Use `absoluteSiteUrl` for every internal URL.

Update `layout.tsx` to use `new URL(getSiteOrigin())` for `metadataBase` and its Person schema URL. Update `sitemap.ts` to emit `/`, `/resume`, `/projects`, and five canonical case-study paths. Update `robots.ts` to point to `absoluteSiteUrl("/sitemap.xml")`.

- [ ] **Step 5: Run the metadata tests**

~~~bash
NEXT_PUBLIC_SITE_URL=https://portfolio.example.test npx tsx --test tests/project-seo.test.ts tests/sitemap.test.ts
~~~

Expected: PASS with no `www` origin and no legacy/unrelated sitemap URLs.

- [ ] **Step 6: Commit origin and SEO helpers**

~~~bash
git add src/content/site.ts src/content/project-seo.ts tests/project-seo.test.ts tests/sitemap.test.ts src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: generate project metadata from deployment origin"
~~~

### Task 4: Add canonical case-study and stable resolver routes

**Files:**

- Create: `src/app/projects/[slug]/page.tsx`
- Create: `src/app/projects/[slug]/live/page.tsx`
- Create: `src/app/projects/[slug]/source/page.tsx`
- Create: `src/components/ProjectLinkUnavailable.tsx`
- Modify: `src/app/work/[slug]/page.tsx`

**Interfaces:**

- Canonical pages use `getCvProject` and `CANONICAL_PROJECT_SLUGS` only.
- Resolver pages call `resolveProjectLink(slug, "live" | "source")`.
- Legacy routes call `getLegacyRedirect` and use `permanentRedirect` for CV slugs/aliases.

- [ ] **Step 1: Add the five canonical static case-study params**

Implement this route contract in `src/app/projects/[slug]/page.tsx`:

~~~ts
export const dynamicParams = false;

export function generateStaticParams() {
  return CANONICAL_PROJECT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getCvProject((await params).slug);
  return project ? getProjectMetadata(project) : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getCvProject((await params).slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
~~~

- [ ] **Step 2: Add data-driven live/source pages**

Each nested route uses the same static params and this behavior:

~~~ts
const result = resolveProjectLink(slug, "live");
if (result.kind === "not-found") notFound();
if (result.kind === "redirect") redirect(result.target);
return <ProjectLinkUnavailable project={result.project} kind="live" reason={result.reason} />;
~~~

The source route uses `"source"`. Add `robots: { index: false, follow: false }` metadata to resolver pages so redirect endpoints do not compete with case-study canonicals.

- [ ] **Step 3: Render an honest unavailable state**

Create `ProjectLinkUnavailable` with a semantic `main`, an `h1`, the project title, the precise reason, a case-study link, an `/projects` link, and a source link when source availability is verified. Do not render a disabled anchor with a fake href.

- [ ] **Step 4: Convert `/work/[slug]` into a compatibility boundary**

Use:

~~~ts
const canonical = getLegacyRedirect(slug);
if (canonical) permanentRedirect(canonical);
const legacy = getLegacyProject(slug);
if (!legacy) notFound();
return <CaseStudy project={legacy} />;
~~~

Include canonical and branded aliases in static params. Keep `/work/token-usage` compatibility-only and omit it from metadata/sitemap/public navigation.

- [ ] **Step 5: Add route contract assertions and run typecheck**

Extend `tests/project-system.test.ts` with exact assertions for all legacy aliases and canonical path helpers, then run:

~~~bash
npx tsx --test tests/project-system.test.ts
npm run typecheck
~~~

- [ ] **Step 6: Commit the route architecture**

~~~bash
git add src/app/projects src/app/work/[slug]/page.tsx src/components/ProjectLinkUnavailable.tsx tests/project-system.test.ts
git commit -m "feat: add canonical project and resolver routes"
~~~

### Task 5: Build the five-project index and case-study presentation

**Files:**

- Create: `src/components/ProjectIndex.tsx`
- Modify: `src/components/CaseStudy.tsx`
- Modify: `src/app/projects/page.tsx`
- Modify: `src/styles/tokens.css`
- Modify: `src/app/globals.css`
- Create: `tests/project-index.test.ts`

**Interfaces:**

- `ProjectIndex({ projects }: { projects: readonly Project[] })` renders cards without querying `allProjects`.
- `CaseStudy({ project }: { project: Project })` renders the data-driven case-study document.

- [ ] **Step 1: Write the failing rendered-index test**

Use `react-dom/server` and the real `ProjectIndex` component to assert that rendered HTML contains all five canonical slugs/titles, contains no `Yor Token Usage`, includes the Zenith live resolver only, and uses `/source` resolver links rather than direct GitHub links.

~~~ts
test("renders only the five CV projects and verified live CTA", () => {
  const html = renderToStaticMarkup(React.createElement(ProjectIndex, { projects: cvProjects }));
  assert.equal(html.includes("Yor Token Usage"), false);
  assert.equal(html.includes("/projects/zenith/live"), true);
  assert.equal(html.includes("/projects/helios/live"), false);
  assert.equal(html.includes("https://github.com/yorayriniwnl/"), false);
  for (const slug of ["portfolio", "helios", "zenith", "ai-vs-real", "talks"]) {
    assert.equal(html.includes("/projects/" + slug), true);
  }
});
~~~

- [ ] **Step 2: Run the red rendered-index test**

~~~bash
npx tsx --test tests/project-index.test.ts
~~~

Expected: FAIL because `ProjectIndex` does not exist.

- [ ] **Step 3: Implement the index using existing design tokens**

Render one selected-work heading, five cards, technical summary, technologies, status, case-study CTA, source CTA, and a live CTA only when `availability.live === "verified"` and `links.live` exists. Use internal paths:

~~~tsx
<ActionLink href={"/projects/" + project.slug}>Case study</ActionLink>
<ActionLink href={"/projects/" + project.slug + "/source"}>Source</ActionLink>
{project.availability.live === "verified" && project.links.live && (
  <ActionLink href={"/projects/" + project.slug + "/live"} primary>View live</ActionLink>
)}
~~~

Keep the index server-rendered and do not add filters for five projects.

- [ ] **Step 4: Upgrade CaseStudy without duplicating project content**

Add the above-fold contribution/status/period/stack metadata and resolver CTAs. Add sections with exact IDs:

~~~tsx
<section id="overview"><h2>01 / Overview</h2></section>
<section id="contribution"><h2>02 / My contribution</h2></section>
<section id="architecture"><h2>03 / System architecture</h2></section>
<section id="implementation"><h2>04 / Technical implementation</h2></section>
<section id="testing"><h2>05 / Testing and validation</h2></section>
<section id="results"><h2>06 / Results and evidence</h2></section>
<section id="limitations"><h2>07 / Limitations</h2></section>
~~~

Use `metrics` and `claims` only for evidence-backed facts. Show the Zenith collaborator text in a visible contribution block. Keep next/previous navigation within `cvProjects`; omit it for the compatibility-only token record.

- [ ] **Step 5: Add focused responsive/accessibility styles**

Use existing black/crimson/paper tokens and current case-study grid. Add visible CTA focus styles, readable mobile metadata stacking, anchor scroll offset, evidence-card wrapping, and unavailable-state spacing. Preserve reduced-motion rules and meaningful alt text.

- [ ] **Step 6: Run the rendered test and typecheck**

~~~bash
npx tsx --test tests/project-index.test.ts
npm run typecheck
~~~

- [ ] **Step 7: Commit the index and case-study UI**

~~~bash
git add src/components/ProjectIndex.tsx src/components/CaseStudy.tsx src/app/projects/page.tsx src/styles/tokens.css src/app/globals.css tests/project-index.test.ts
git commit -m "feat: build recruiter-facing project index and case studies"
~~~

### Task 6: Defer the existing 3D demo and finish project-specific evidence copy

**Files:**

- Create: `src/components/DeferredProjectDemo.tsx`
- Modify: `src/components/ProjectDemo.tsx`
- Modify: `src/content/projects.ts`
- Modify: `src/components/CaseStudy.tsx`
- Test: `tests/project-system.test.ts`

**Interfaces:**

- `DeferredProjectDemo({ mode, art }: { mode: ProjectDemoMode; art: string })` renders a lightweight placeholder until its section approaches the viewport, then dynamically imports `ProjectDemo` with `ssr: false`.
- `ProjectDemoMode` is limited to `"talks" | "helios" | "ai-vs-real" | "zenith"`.

- [ ] **Step 1: Add a failing mode contract test**

Extend the content tests to assert that no CV project has `demoMode === "token-usage"` and that portfolio has no demo mode. The existing test must fail while the old mode remains in the source/data.

- [ ] **Step 2: Remove the token demo mode and rename canonical modes**

Update `ProjectDemo.tsx` so the mode union and labels use `talks` and `ai-vs-real`, remove token-specific scene/labels/options, and keep the existing deterministic explanatory behavior for the four eligible projects.

- [ ] **Step 3: Implement the deferred client boundary**

Create a client component that observes a placeholder and renders a dynamic import only after intersection:

~~~tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ProjectDemoMode } from "@/content/projects";

type Props = { mode: ProjectDemoMode; art: string };
const LazyProjectDemo = dynamic(
  () => import("./ProjectDemo").then((module) => module.ProjectDemo),
  { ssr: false },
);

export function DeferredProjectDemo(props: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { rootMargin: "240px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={wrapperRef}>
      {visible ? <LazyProjectDemo {...props} /> : (
        <div className="demo-placeholder">Interactive explanation loads when reached.</div>
      )}
    </div>
  );
}
~~~

Use it only when `project.demoMode` is present. Portfolio’s textual case study must not import the 3D scene chunk during initial rendering.

- [ ] **Step 4: Add evidence-bounded project copy**

Complete the five records’ `implementation`, `testing`, `results`, `metrics`, `limitations`, and `seo` fields using these exact boundaries:

- Portfolio: Next.js App Router, TypeScript, existing R3F/Three homepage/demo boundary, repository project-system tests after implementation; no 24-test claim.
- Helios: FastAPI REST/WebSocket, deterministic simulator, interpretable rule-based anomaly path, backend pytest/CI evidence, no field telemetry or latency claim.
- Zenith: bill/roof/tariff/scenario product flow, visual decision support, illustrative values, Nivedana/Ayush attribution, no investment or production claim.
- AI vs. Real: grayscale/resize, 17-value LBP/GLCM feature vector, scaler and RBF SVM, fixed stratified split, 78.5% on the 107-image holdout, confidence limitations.
- Talks: React/Vite client, Express/Socket.IO server, PostgreSQL/Drizzle durable state, Redis transient work, server-owned realtime permissions, bounded readiness audit, deployment blocked.

- [ ] **Step 5: Run content tests and typecheck**

~~~bash
npx tsx --test tests/*.test.ts
npm run validate:content
npm run typecheck
~~~

- [ ] **Step 6: Commit the performance/evidence update**

~~~bash
git add src/components/DeferredProjectDemo.tsx src/components/ProjectDemo.tsx src/content/projects.ts src/components/CaseStudy.tsx tests
git commit -m "perf: defer case-study 3D demos and bound evidence copy"
~~~

### Task 7: Finish navigation, homepage/resume links, validation, and documentation

**Files:**

- Modify: `src/components/SiteNav.tsx`
- Modify: `src/components/Universe.tsx`
- Modify: `src/components/Home.tsx`
- Modify: `src/app/resume/page.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `scripts/validate-content.mjs`
- Modify: `README.md`
- Create: `tests/content-guard.test.ts`

**Interfaces:**

- Every recruiter-facing project link uses `/projects/[slug]`, `/projects/[slug]/live`, or `/projects/[slug]/source`.
- The static content validator rejects missing canonical slugs, missing route files, legacy URLs in new user-facing code, wrong host mapping, and token exposure in the public index.

- [ ] **Step 1: Write the failing content-validator contract test before changing the validator**

Create `tests/content-guard.test.ts` so the validator source is required to encode the new public boundary:

~~~js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("content validator encodes the canonical five-project boundary", () => {
  const source = readFileSync("scripts/validate-content.mjs", "utf8");
  assert.match(source, /portfolio.*helios.*zenith.*ai-vs-real.*talks/s);
  assert.match(source, /src\\/app\\/projects\\/\\[slug\\]\\/live\\/page\\.tsx/);
  assert.match(source, /NEXT_PUBLIC_SITE_URL|yorayriniwnl\\.in/);
});
~~~

Run `npx tsx --test tests/content-guard.test.ts`. Expected: FAIL because the validator still encodes only the old project set and route surface.

- [ ] **Step 2: Replace homepage/resume project collections**

Use `cvProjects` in the existing homepage surfaces, classify portfolio as a product category, replace `/work` links with `/projects`, and replace direct repository CTAs with `/source` resolver links. Render all five resume selected-work entries using canonical case-study links.

- [ ] **Step 3: Update navigation and not-found recovery**

Change the human-facing navigation label to:

~~~ts
["Work", "/projects"]
~~~

Point the not-found recovery action to `/projects` while preserving the rest of the site navigation.

- [ ] **Step 4: Strengthen content validation and README route documentation**

Document the canonical routes, the `NEXT_PUBLIC_SITE_URL` requirement, the custom-domain routing boundary, and the unavailable live states. Keep legacy token data documented only as compatibility data. Add checks for canonical titles, Talks stack wording, Zenith attribution, AI holdout wording, and required repository media.

- [ ] **Step 5: Search for stale user-facing URLs and claims**

Run:

~~~bash
rg -n "/work/|texture-forensics|yor-talks|token-usage|yorayriniwnl\\.in|Next\\.js.*FastAPI|production-grade|78\\.5" src README.md scripts
~~~

Review every match. Remaining legacy aliases must be resolver/data compatibility references, not new user-facing links. The separate site origin may remain only in explanatory documentation; it must not be a portfolio live/canonical target.

- [ ] **Step 6: Run validators and commit the integration cleanup**

~~~bash
npm run validate:content
npm run validate:assets
npm run typecheck
git add src/components/SiteNav.tsx src/components/Universe.tsx src/components/Home.tsx src/app/resume/page.tsx src/app/not-found.tsx scripts/validate-content.mjs README.md
git commit -m "chore: connect navigation and validation to canonical projects"
~~~

### Task 8: Run complete verification and perform browser/accessibility review

**Files:**

- Modify: any implementation file required by a failing verification gate
- Test: all `tests/*.test.ts`

- [ ] **Step 1: Run the complete automated suite with an explicit non-production verification origin**

~~~bash
npm ci
npm test
npm run lint
npm run typecheck
npm run validate:content
npm run validate:assets
NEXT_PUBLIC_SITE_URL=https://portfolio.example.test npm run build
~~~

Expected: all tests pass; lint/typecheck/content/assets/build complete without warnings or errors caused by this work.

- [ ] **Step 2: Start the local production server**

~~~bash
NEXT_PUBLIC_SITE_URL=https://portfolio.example.test npm run start
~~~

Keep the server session active for route verification.

- [ ] **Step 3: Verify canonical pages and 404 behavior**

Request:

~~~text
/projects
/projects/portfolio
/projects/helios
/projects/zenith
/projects/ai-vs-real
/projects/talks
/projects/not-a-project
~~~

Confirm the first six return 200, only five cards appear on `/projects`, and the unknown slug returns 404.

- [ ] **Step 4: Verify resolver and legacy behavior**

Confirm with headers/body checks:

~~~text
/projects/zenith/live          -> redirect to https://zenith-xi-snowy.vercel.app
/projects/portfolio/live       -> redirect to https://yorayriniwnl.in
/projects/helios/live          -> redirect to https://yor-helios-demo.vercel.app (frontend demo only)
/projects/ai-vs-real/live      -> redirect to https://yor-ai-vs-real-detector.vercel.app
/projects/talks/live           -> honest unavailable state
/projects/talks/source         -> redirect to github.com/yorayriniwnl/yor-talksv2
/projects/helios/source        -> redirect to github.com/yorayriniwnl/Yor-Helios
/work/helios                   -> permanent redirect to /projects/helios
/work/zenith                   -> permanent redirect to /projects/zenith
/work/texture-forensics        -> permanent redirect to /projects/ai-vs-real
/work/yor-talks                -> permanent redirect to /projects/talks
/work/token-usage              -> compatibility-only behavior, not a new link
~~~

Recheck `https://zenith-xi-snowy.vercel.app` during this step. If it is not reachable, remove its live target and let `/projects/zenith/live` render unavailable.

- [ ] **Step 5: Verify metadata and sitemap output**

Inspect generated HTML for each canonical page and confirm:

- canonical URL uses `https://portfolio.example.test/projects/[slug]` in local verification;
- title, description, Open Graph, and Twitter data are project-specific;
- resolver pages are noindex;
- sitemap contains `/projects` and exactly five canonical case-study URLs;
- sitemap/robots contain no `/work` or token-usage URLs.

- [ ] **Step 6: Perform responsive, keyboard, and reduced-motion checks**

At mobile and desktop widths, verify no horizontal overflow, readable metadata, usable CTA wrapping, stable architecture media, and no layout shift from the deferred demo placeholder. Keyboard through navigation, cards, CTAs, section links, and unavailable-state recovery; confirm visible focus. Enable `prefers-reduced-motion` and confirm the static demo path remains usable.

- [ ] **Step 7: Inspect the final diff and commit verification fixes**

~~~bash
git diff --check
git status --short
git diff --stat
git log --oneline -8
~~~

If verification finds an implementation defect, add the regression assertion to `tests/project-system.test.ts` or the relevant existing test file first, make the smallest fix in the affected `src/` file, rerun the affected gate, and commit:

~~~bash
git add tests src
git commit -m "fix: close project system verification gap"
~~~

### Task 9: Request final code review and prepare delivery report

**Files:**

- No new production files unless review identifies a tested defect
- Review: full branch diff and verification logs

- [ ] **Step 1: Review scope and ownership claims**

Confirm the diff contains no unrelated project migration, no source-repository edits, no fabricated deployment, no unbounded metric, and no stale Talks stack claim.

- [ ] **Step 2: Run the final verification commands again**

~~~bash
npm test
npm run lint
npm run typecheck
npm run validate:content
npm run validate:assets
NEXT_PUBLIC_SITE_URL=https://portfolio.example.test npm run build
~~~

- [ ] **Step 3: Record exact delivery facts**

Prepare the final report with architecture, exact files changed, routes, redirects, live/source mappings, corrected claims, tests, all gate results, projects without verified live deployment, the required `NEXT_PUBLIC_SITE_URL` deployment configuration, CV link lines, and remaining risks.

- [ ] **Step 4: Commit only if all gates are green**

~~~bash
git status --short --branch
git log --oneline -10
~~~

Do not claim completion until the final test, lint, typecheck, build, route, metadata, mobile, keyboard, and scope checks are recorded.
