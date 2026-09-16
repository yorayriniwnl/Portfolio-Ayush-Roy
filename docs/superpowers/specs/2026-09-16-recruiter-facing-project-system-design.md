# Recruiter-Facing Project System

**Date:** 2026-09-16  
**Status:** Approved design; implementation pending  
**Scope:** The five projects currently represented on Ayush Roy's CV

## Context

The portfolio currently renders project case studies from `/work/[slug]` and uses one shared project array for the homepage, resume, case-study navigation, and sitemap. The array contains four featured projects plus the unrelated Yor Token Usage project. Project records contain useful evidence and repository-pinned media, but they do not yet provide a canonical public namespace, stable live/source resolvers, explicit link availability, or a clean separation between CV projects and legacy data.

The portfolio must become the stable professional layer between a CV link and independently deployed/source-controlled projects. The new recruiter-facing experience must be truthful, fast, maintainable, and compatible with existing shared `/work` URLs.

## Goals

1. Establish `/projects` and five canonical case-study URLs:
   - `/projects/portfolio`
   - `/projects/helios`
   - `/projects/zenith`
   - `/projects/ai-vs-real`
   - `/projects/talks`
2. Make the index and all new navigation expose only those five CV projects.
3. Provide data-driven `/live` and `/source` resolver routes without proxying external applications.
4. Preserve sensible `/work` compatibility with permanent redirects.
5. Make project ownership, collaborators, evidence, status, and limitations visible in every case study.
6. Generate canonical metadata and sitemap entries from the same canonical registry.
7. Preserve the established YOR visual language while improving scanability, mobile behavior, accessibility, and initial-load performance.

## Non-goals

- Migrating, redesigning, or promoting Yor Token Usage or any other non-CV project.
- Rewriting the homepage or the source project repositories.
- Fabricating metrics, screenshots, hosted deployments, authorship, or production claims.
- Adding a heavy analytics or content-management system.
- Creating separate architecture/testing pages for individual projects.

## Selected approach

Use a canonical project registry with an isolated legacy collection.

```text
cvProjects       -> all /projects pages, index cards, sitemap, resume links, next/previous navigation
legacyProjects   -> compatibility-only data; never exposed by the new recruiter-facing experience
resolver helpers  -> canonical lookup, alias lookup, live/source target state, legacy redirects
```

This keeps the current content architecture recognizable while making public visibility an explicit data decision. A route-only wrapper around the existing array would leave the unrelated project mixed into the recruiter-facing data flow. MDX would add authoring and migration complexity without solving the routing and evidence problems.

## Data model

The existing `Project` fields remain the foundation. The model will gain only the fields needed for routing, ownership, visibility, link state, and metadata:

```ts
type ProjectLinkStatus = "verified" | "unavailable";

type Project = {
  id: string;
  slug: string;
  aliases: readonly string[];
  title: string;
  shortTitle?: string;
  kicker: string;
  purpose: string;
  status: string;
  role: string;
  period: string;
  collaborators?: string;
  technologies: readonly string[];
  links: {
    live?: string;
    source?: string;
  };
  availability: {
    live: ProjectLinkStatus;
    source: ProjectLinkStatus;
  };
  visibility: {
    featured: boolean;
    portfolio: boolean;
    resume: boolean;
  };
  // Existing case-study content remains here:
  // problem, contribution/role, constraints, workflow, hardPart,
  // decisions, architecture, testing/evidence, results, limitations,
  // lessons, nextIteration, media, claimIds.
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
};
```

`links` contain only absolute HTTP(S) targets. The resolver treats a verified status without a valid target as unavailable, so bad content data cannot produce a silent broken link. No runtime health check will be performed during page rendering; availability is an explicit, audited content fact rather than a source of request latency or nondeterministic builds.

The registry migration is:

| Canonical slug | Existing/legacy slug or alias | Evidence boundary |
| --- | --- | --- |
| `portfolio` | New entry | This repository's actual Next.js/TypeScript/R3F architecture; no distinct deployment verified and no invented test metric |
| `helios` | `yor-helios` | Experimental, deterministic/demo telemetry; no hosted deployment verified |
| `zenith` | `yor-zenith` | Experimental solar decision surface; Nivedana credited with architecture/full-stack work and Ayush with interface direction/product experience |
| `ai-vs-real` | `texture-forensics`, `yor-ai-vs-real-image` | 78.5% on the specific 107-image holdout; not universal detector accuracy |
| `talks` | `yor-talks`, `yor-talks-v2` | React/Vite + Express/Socket.IO + PostgreSQL/Drizzle + Redis; deployment blocked/unverified |

The existing `token-usage` record and claim remain in `legacyProjects`/legacy claims so useful historical data is not deleted. It will not be returned by `cvProjects`, linked from new pages, included in the sitemap, or included in new case-study navigation.

Claims will use canonical project identifiers for the five public entries. Existing evidence URLs and repository-pinned media will remain the evidence source unless a wording or slug update is required. Illustrative telemetry and sample solar values will be labelled as illustrative/demo behavior.

## Routing and resolver behavior

### Canonical pages

- `/projects` is a server-rendered selected engineering-work index built only from `cvProjects`.
- `/projects/[slug]` is the single coherent case-study document. Static params and metadata are generated only for canonical CV slugs; unknown slugs return 404.
- `/projects/[slug]/live` resolves an audited live target. Available projects redirect to the target; unavailable projects render a clear state explaining that no verified public deployment is exposed.
- `/projects/[slug]/source` resolves an audited source target. Available projects redirect to the repository; missing/bad targets render a clear unavailable state.

The resolver result is deliberately explicit:

```ts
type ResolverResult =
  | { kind: "redirect"; target: string }
  | { kind: "unavailable"; reason: string }
  | { kind: "not-found" };
```

The live/source pages use Next's server redirect for valid targets. These routes are a stable portfolio namespace, not an application proxy and not a second deployment of any external project.

### Legacy migration

The existing `/work/[slug]` route becomes a compatibility boundary:

- `/work/helios` -> permanent redirect to `/projects/helios`
- `/work/yor-helios` -> permanent redirect to `/projects/helios`
- `/work/zenith` -> permanent redirect to `/projects/zenith`
- `/work/yor-zenith` -> permanent redirect to `/projects/zenith`
- `/work/texture-forensics` -> permanent redirect to `/projects/ai-vs-real`
- `/work/yor-ai-vs-real-image` -> permanent redirect to `/projects/ai-vs-real`
- `/work/yor-talks` -> permanent redirect to `/projects/talks`
- `/work/yor-talks-v2` -> permanent redirect to `/projects/talks`

The unrelated legacy token route may continue to render existing data for compatibility, but it receives no new canonical route or recruiter-facing link. Unknown legacy slugs return 404.

## Case-study experience

`CaseStudy` remains the reusable presentation layer, with data-driven content and no project-specific route duplication.

The above-fold hero contains only high-signal information:

- project title
- technical one-line description
- role/contribution
- status
- period
- primary technologies
- live CTA only when available
- source CTA through `/source`

The body uses stable anchors for the sections that matter during interviews:

`#overview`, `#contribution`, `#architecture`, `#implementation`, `#testing`, `#results`, and `#limitations`.

Existing content will be reorganized into the reusable structure without forcing equal length across projects. Emphasis will vary by evidence:

- Portfolio: Next.js architecture, TypeScript, R3F/Three rendering boundaries, accessibility, deployment, and project-system tests.
- Helios: meter/simulator -> FastAPI ingest -> anomaly analysis -> SQL storage/WebSocket operator interpretation, with deterministic/demo boundaries.
- Zenith: site/tariff inputs, solar scenario modelling, visual decision support, assumptions, and exact attribution.
- AI vs. Real: preprocessing, LBP/GLCM feature extraction, scaler/SVM evaluation, holdout methodology, and confidence limitations.
- Talks: authentication/authorization, server-owned Socket.IO permissions, PostgreSQL durability, Redis transient work, persistence, and deployment-readiness limits.

The next/previous links use `cvProjects` only. Project media remains repository-backed with meaningful alt text and source references; no fabricated screenshots or decorative metrics will be added.

## Live/source status at audit time

The initial audited mapping is:

| Project | Live state | Source state |
| --- | --- | --- |
| Portfolio | `https://yorayriniwnl.in` is the verified custom-domain deployment for this repository | `https://github.com/yorayriniwnl/Portfolio-Ayush-Roy` |
| Helios | Unavailable; no hosted deployment found | `https://github.com/yorayriniwnl/Yor-Helios` |
| Zenith | `https://zenith-xi-snowy.vercel.app` reachable during audit; production readiness remains unclaimed | `https://github.com/yorayriniwnl/Yor-Zenith` |
| AI vs. Real | Unavailable; local/demo inference only | `https://github.com/yorayriniwnl/Yor-Ai-vs-real-image` |
| Talks | Unavailable; current repository says deployment blocked | `https://github.com/yorayriniwnl/yor-talksv2` |

The Zenith URL will be rechecked during final verification. If it is not reachable then, its live state will be changed to unavailable rather than leaving a broken CTA. The final deployment audit may promote a project from unavailable only when its actual bounded surface builds and responds; a frontend-only demo must remain labeled as such.

## SEO and discoverability

- Define the canonical site origin through `NEXT_PUBLIC_SITE_URL`, set to `https://yorayriniwnl.in` for the linked deployment. Local development may use `http://localhost:3000`; a non-Vercel production build must fail clearly when the variable is absent.
- Keep the existing homepage on `https://yorayriniwnl.in` and add the recruiter-facing project system beneath `/projects`; the project case studies and their canonical metadata use that same custom domain.
- Generate absolute canonical URLs at `/projects/[slug]` from the configured deployment origin.
- Generate unique title, description, Open Graph, and Twitter metadata from each project record.
- Use an existing project visual as `ogImage` only when it is suitable; do not create a social-card subsystem.
- Include `/projects`, the five canonical case studies, the homepage, and resume in the sitemap.
- Exclude redirect endpoints and legacy `/work` URLs from the sitemap.
- Point robots metadata and sitemap URLs to the configured deployment origin.

## Navigation, accessibility, and performance

- Change the human-facing work navigation entry to `Work` -> `/projects` while retaining the existing navigation structure.
- Update existing homepage/resume project links to canonical case-study and resolver routes.
- Keep `/projects` and textual case-study content server-rendered.
- Defer the existing Three.js/R3F interactive demo into a client-only, below-the-fold load path so reading a case study does not eagerly load the 3D bundle.
- Preserve semantic heading order, visible focus, keyboard-accessible CTAs, useful image alt text, reduced-motion behavior, and responsive typography.
- Avoid new large dependencies, fake data visualizations, invasive analytics, and broad visual redesign.

## Validation strategy

Add focused TypeScript tests for pure project-system behavior rather than snapshot noise:

1. canonical project lookup and exact allowed slug set
2. alias canonicalization
3. legacy `/work` mapping
4. verified live resolver behavior
5. unavailable-live behavior
6. source resolver behavior and bad-link handling
7. index visibility excluding legacy projects
8. metadata/canonical URL generation
9. sitemap contents and absence of `/work`/legacy project URLs

The implementation will also run the existing content and asset validators, lint, typecheck, production build, and manual route checks. The current lockfile drift must be repaired as part of dependency setup before those gates can run.

## Expected code surfaces

Likely changes are limited to:

- `src/content/projects.ts` and `src/content/claims.ts`
- new project index/resolver or unavailable-state components
- `src/components/CaseStudy.tsx`, existing project listing components, navigation, and targeted CSS
- new `/projects` route files
- legacy `/work/[slug]` compatibility route
- sitemap and robots metadata
- resume/project links and content validation
- focused tests and the package test script
- README route documentation

No unrelated project repositories or source code will be changed.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Existing `/work` links break | Permanent redirect boundary with alias tests |
| Unrelated legacy project leaks into recruiter view | Separate `cvProjects` registry and index/sitemap tests |
| Stale or dead live deployment | Explicit audited availability and final HTTP verification |
| Claims overstate authorship or maturity | Repository evidence, bounded wording, visible collaborator attribution |
| Case-study pages become heavy | Server-rendered text and deferred R3F demo |
| Existing lockfile blocks verification | Synchronize dependencies before test/build gates |
| SEO duplication between `/work` and `/projects` | Redirect legacy CV routes and emit canonical metadata only for `/projects` |
