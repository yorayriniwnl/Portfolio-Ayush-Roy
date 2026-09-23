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

## Rendering and interaction architecture

- The homepage `Home` component is a Server Component. The hero loads through `HeroSceneIsland`, which dynamically imports one client Canvas after idle time and skips it for reduced motion.
- `HeroScene` uses `THREE.WebGPURenderer` with a WebGL test path, hardware/viewport/DPR quality tiers, visibility pausing, and an error boundary. The current core is an icosahedron with wireframe, three torus rings, six small orbiting project nodes, red point lights, and 140–420 dust points. Its pointer response and slow rotations are frame-damped, but it has no state connection to scroll sections or project focus.
- Case-study explanations use a second, separately mounted Canvas in `ProjectDemo`, deferred until its section approaches the viewport. The current experience therefore consists of an isolated homepage scene plus independent case-study scenes, without a shared scene director or route continuity.
- Navigation is a client component with a keyboard-operable mobile menu, Escape dismissal, and focus restoration. The page includes a skip link and semantic main/section landmarks.

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
- No reliable FPS, Lighthouse, LCP, or field-performance measurement was available in this audit. Do not present the 60 FPS target as a measured result.

## Design implications

1. Replace the serif name/globe-and-rings/card-grid visual system with the requested architectural YOR wordmark, controlled titanium/red material palette, project-specific scene forms, and large editorial project navigation.
2. Centralize scroll, pointer, section, project-focus, route, viewport, reduced-motion, and visibility state in one experience director. A shared Canvas scoped to the recruiter homepage and case-study routes is the leading architecture to evaluate; resume and Lab should stay lightweight.
3. Keep project navigation and essential details in DOM links and semantic HTML. Reuse repository-authored images and text, enlarge case-study evidence, and preserve all canonical, source/live, legacy, and SEO behavior.
4. Replace the global override stack with named design layers. Extend browser QA to all requested viewports and the canonical case-study routes, and make its local runner portable to this Windows environment.
