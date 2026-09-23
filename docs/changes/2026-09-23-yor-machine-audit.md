# YOR // THE MACHINE — Forensic Audit

Audit date: 2026-09-23
Repository baseline: `main` at `4eff7960f2f377ef4710de7353329cdf4dcb1462`
Production origin: `https://yorayriniwnl.in`

This report records the existing production experience and repository before the requested redesign. Project facts below remain repository-owned content; the visual rebuild must not rewrite their evidence boundaries.

## Production and visual hierarchy

- The live homepage and the canonical project, Lab, and resume pages are reachable. The homepage opens with “Ayush Roy” in large serif type and “Product / Full-Stack Engineer” as the secondary display line.
- The hero pairs that typography with a crimson faceted core, several orbit rings, satellites, grid lines, and small vertical technical labels. The 1440×900 and 390×844 local captures show this same split layout; at mobile width the headline becomes very tall and the engineering focus rows consume much of the first screen.
- The six recruiter projects are currently presented as a conventional two-column card grid after a separate evidence strip. The rest of the homepage adds engineering-principle cards, a Lab gateway, a résumé-like About frame, and a conventional contact section.
- The visual tokens are `#070708`, bright crimson/red, serif display type, and a system sans body. Technical labels use monospace throughout navigation, metadata, status, and card details. A 48,780-byte `globals.css` is followed by a separate 3,200-byte `rebuild.css` override layer.
- Project case studies already use semantic headings and readable text, with repository-authored diagrams and artwork. CandidateX’s page, for example, has a large title and introduction, a definition-list summary, a section navigator, technical architecture, evidence, limitations, and a gallery. Preserve that recruiter-readable structure while giving the visuals more room.

### Live production recheck — 2026-09-23

- The homepage, `/projects`, `/projects/candidatex`, `/resume`, and `/lab` returned crawlable page content during the recheck. The homepage still leads with “Ayush Roy” and “Product / Full-Stack Engineer,” followed by focus rows and four hero actions: Explore Work, Resume, GitHub, and LinkedIn.
- The production project list currently appears in this display order: CandidateX, Yor Helios, Personal Developer Portfolio, Yor Zenith, Yor AI vs. Real Image Detector, Yor Talks V2. The requested rebuild order is CandidateX, Zenith, Helios, AI vs Real, Yor Talks, Portfolio.
- The CandidateX route still exposes semantic role, contribution, architecture, implementation, validation, results, limitations, and four repository-authored visuals with alt text. This is valuable evidence to preserve and enlarge rather than replace with a scene-only explanation.
- The public resume still includes education and a BSNL Telecom & Data Network internship entry. Preserve those verified resume facts while keeping the project worlds limited to the six canonical project records.
- A direct production HTTP smoke check returned 200 for `/`, `/projects`, all six canonical case studies, `/resume`, and `/lab`; an unknown project slug returned 404. The sampled `/work/helios` legacy route returned 308 to `/projects/helios`. All six `/projects/[slug]/source` routes returned 307 to their configured repositories; the five verified `/live` routes returned 307 to their configured destinations; `/projects/talks/live` returned 200 with the unavailable/deployment-blocked state. Redirects were inspected without following them. This verifies current HTTP route behavior, not browser history or every legacy alias.

### Baseline browser visual and interaction QA — 2026-09-23

- Headless Chrome captured the production homepage at all ten requested viewport sizes; the screenshots and report are retained in the task visualization workspace, outside the Git checkout. The homepage had no horizontal overflow at any of those widths. Route captures cover `/projects`, CandidateX, resume, and Lab; the accessibility sweep found no unnamed interactive nodes on those sampled routes.
- At 390×844 with reduced motion emulated, the homepage reported `Static field · reduced motion` and mounted zero canvases. The desktop capture still shows the dim name/supporting copy, the separate faceted core with orbit rings, and hero actions falling below the first viewport; the mobile capture places the oversized name ahead of the supporting copy and pushes the remaining action links below the captured screen.
- The browser sweep exposed one actual 404: Chromium requests `/favicon.ico`, which is absent. The repository has `public/favicon.svg` and it returns 200, but the production document emits no `rel="icon"` link; the current QA runner filters favicon errors, masking the missing icon declaration.
- The production console had no other captured HTTP error during the sampled homepage, projects, CandidateX, resume, and Lab routes. This was a headless smoke/a11y pass, not a Lighthouse, field-performance, or 60 FPS measurement.

## Rendering and interaction architecture

- The homepage `Home` component is a Server Component. The hero loads through `HeroSceneIsland`, which dynamically imports one client Canvas after idle time and skips it for reduced motion.
- `HeroScene` uses `THREE.WebGPURenderer` with a WebGL test path, hardware/viewport/DPR quality tiers, visibility pausing, and an error boundary. The current core is an icosahedron with wireframe, three torus rings, six small orbiting project nodes, red point lights, and 140–420 dust points. Its pointer response and slow rotations are frame-damped, but it has no state connection to scroll sections or project focus.
- Case-study explanations use a second, separately mounted Canvas in `ProjectDemo`, deferred until its section approaches the viewport. The current experience therefore consists of an isolated homepage scene plus independent case-study scenes, without a shared scene director or route continuity.
- Navigation is a client component with a keyboard-operable mobile menu, Escape dismissal, and focus restoration. The page includes a skip link and semantic main/section landmarks.

## Route and test-coverage audit

- The root layout is a Server Component that owns global metadata, Person JSON-LD, the skip link, and navigation. The six canonical project pages use static params and reject unknown slugs; source/live resolver routes also use static params and delegate destination decisions to the project-system resolver. The `/work/[slug]` compatibility route preserves permanent redirects for canonical aliases and serves legacy case studies where appropriate.
- `CaseStudy` remains server-rendered; `DeferredProjectDemo` is the narrow client boundary that loads `ProjectDemo` on approach. `ProjectDemo` creates its own React Three Fiber Canvas and WebGPU-aware renderer for eligible demos. The homepage separately loads its hero Canvas through `HeroSceneIsland`. A shared route-level experience owner does not exist yet.
- Existing tests protect project registry membership/order, aliases, resolver destinations and unavailable states, metadata/SEO, sitemap, scene quality selection, and several content-evidence boundaries. They are mostly pure unit, source-assertion, or static-render tests; they do not establish client-side route-transition continuity, browser history behavior, all-route refresh behavior, or rendered visual quality.
- The current browser runner covers six viewport sizes (1440×900, 1366×768, 768×1024, 390×844, 360×800, and 320×568) instead of the requested ten-size matrix. It exercises the homepage at those sizes, then checks `/projects`, CandidateX, resume, and Lab at desktop/mobile; source/live routes and the remaining five canonical case studies are not loaded in its route loop.
- The browser runner uses full-page `Page.navigate`, so it does not verify in-app route transitions or back/forward history. It checks the mobile menu, initial skip-link focus, reduced-motion homepage fallback, basic accessible names, one H1, overflow, and CandidateX gallery/live CTA. It currently asserts baseline-specific headings/status selectors that must change with the new design. Its global browser-error collection also includes the intentional 404 visit, so expected not-found diagnostics must be isolated from unexpected runtime errors.
- The final audit should run against a production build, while the checked-in runner currently starts the development server. The runner also assumes Unix `which` and a `npm` executable on PATH; neither is reliable in the current Windows environment. The final harness needs a configurable cross-platform package-manager/browser path and a production-equivalent server mode.

## Crosswalk to the existing 2026-09-18 implementation plan

- The core deliverables from the earlier production-hardening plan are already in the baseline: centralized six-project registry/resolvers, server-rendered homepage with a dynamically isolated hero island, `/lab` separation, repository-authored CandidateX evidence visuals, resume/metadata/security work, and automated project/content/SEO tests. Reuse these rather than rebuilding them.
- The old scene-cleanup milestone removed the `Universe` components, but `package.json` and the tracked lockfile still declare `chess.js` and `motion`. A source search found no TypeScript imports for either dependency; retain Motion only if the new centralized choreography actually uses it, and remove `chess.js` if no other runtime consumer exists.
- The old plan's remaining scene and QA milestones are not sufficient for the new directive: the current hero still uses the faceted core/orbit-ring language, project focus does not drive a shared route state, and each eligible case-study demo mounts its own Canvas. The requested persistent machine world is a new architectural step.
- The old browser QA milestone covers the prior six-width matrix and a small subset of routes. It does not satisfy this brief's ten viewports, all six case-study routes, all resolver outcomes, client-side history/transition behavior, production-build browser pass, or required visual screenshot set.
- Prior baseline tests and production build passed, but the old plan's final-checklist state is not current proof of the new release bar. Final validation must be rerun after implementation against the expanded route/motion/performance matrix.

## Live SEO and security recheck — 2026-09-23

- The production root response returned HTTP 200 with canonical `https://yorayriniwnl.in`, an Open Graph title, a `summary_large_image` Twitter card, and a Person JSON-LD script.
- A per-route production scan verified a page title, description, and expected canonical URL on `/`, `/projects`, all six canonical case studies, `/resume`, and `/lab`; all ten canonical values matched after normalizing the root URL without a trailing slash.
- `robots.txt` allows crawling and declares `https://yorayriniwnl.in/sitemap.xml`. The sitemap contains the root, resume, Lab, project index, and all six canonical project routes; it excludes `/work` aliases and source/live resolver URLs.
- The root response currently sends CSP with `default-src 'self'`, `object-src 'none'`, and same-origin resource boundaries; it also sends HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive Permissions-Policy. These were observed on the production homepage response; recheck them after release.

## Content, routes, and SEO

- `src/content/project-registry.ts` owns exactly six canonical CV projects. The current display order differs from the requested order; the rebuild can reorder presentation while keeping the canonical registry, slugs, titles, evidence, and status records intact.
- Important truth boundaries include CandidateX’s 28,800 paper benchmark versus its separate 4,800-sample implementation ablation; the 78.5% result being limited to AI vs. Real’s repository-stated 107-image holdout; Helios being a public frontend demo rather than a hosted FastAPI/WebSocket backend; Zenith being an experimental, assumption-bound interface; and Yor Talks remaining deployment-blocked.
- The App Router statically generates the six `/projects/[slug]` pages and their `/source` and `/live` resolvers. `/work/[slug]` remains a legacy compatibility route with permanent redirects. `/`, `/lab`, `/resume`, `/projects`, metadata, sitemap, robots, JSON-LD, CSP, and security headers are present.
- The previous approved project spec also keeps employment/KPIT material out of scope. Preserve this constraint and the established evidence policy.

## Baseline validation and performance evidence

- Existing automated suite: 40 tests passed.
- `lint`, `typecheck`, `validate:content`, and `validate:assets` passed. The local media budget is 78,440 bytes across 24 files.
- A production build completed successfully and statically generated 41 pages. The generated static-chunk directory contains 2,218,099 bytes across 15 files in aggregate; this is a whole-build total, not homepage transfer size or a measured Web Vital.
- Browser QA passed after a temporary Windows-only audit shim. It covered the homepage at 1440, 1366, 768, 390, 360, and 320 widths; checked the project index, CandidateX, resume, and Lab at desktop/mobile; and checked keyboard navigation, Escape dismissal, reduced motion, accessibility basics, overflow, and the not-found page.
- The checked-in browser QA script needs harness fixes: it starts the dev server via `npm` and discovers Chromium with Unix `which`, neither of which works in this Windows shell. Its project/resume text checks were case-sensitive against visually uppercased labels, and its final error scan treated the deliberately requested 404 route as an unexpected browser error.
- A repeated cold-cache headless Chrome sample reported `PerformanceResourceTiming.transferSize` of 562,300 bytes across 8 homepage script resources and 613,221 bytes across 26 total resources at 1440×900. CandidateX reported 149,942 bytes across 7 script resources and 196,319 bytes across 23 total resources at 1440×900. These are browser-observed transfer totals, not uncompressed bundle size or field data.
- A local headless scene probe observed one Canvas reach `WebGPU / high` about 1.91 seconds after navigation at 1440×900. Headless `requestAnimationFrame` averaged about 161 callbacks/second, but that environment is not refresh-synchronized; it cannot validate the 60 FPS target.
- The LCP observer produced a homepage desktop candidate between 1.23–1.34 seconds, but returned no candidate on mobile and was inconsistent for CandidateX across repeats. Treat LCP as unmeasured for comparison purposes. No usable FPS measurement, Lighthouse report, or field-performance measure was available; do not present the 60 FPS target as measured.

## Design implications

1. Replace the serif name/globe-and-rings/card-grid visual system with the requested architectural YOR wordmark, controlled titanium/red material palette, project-specific scene forms, and large editorial project navigation.
2. Centralize scroll, pointer, section, project-focus, route, viewport, reduced-motion, and visibility state in one experience director. A shared Canvas scoped to the recruiter homepage and case-study routes is the leading architecture to evaluate; resume and Lab should stay lightweight.
3. Keep project navigation and essential details in DOM links and semantic HTML. Reuse repository-authored images and text, enlarge case-study evidence, and preserve all canonical, source/live, legacy, and SEO behavior.
4. Replace the global override stack with named design layers. Extend browser QA to all requested viewports and the canonical case-study routes, and make its local runner portable to this Windows environment.
