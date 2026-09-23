# YOR // THE MACHINE — Design Specification

**Status:** Proposed implementation of the user-approved direction in the 23 Sep 2026 rebuild request.
**Repository baseline:** `4eff7960f2f377ef4710de7353329cdf4dcb1462`.
**Audit:** [`docs/changes/2026-09-23-yor-machine-audit.md`](../../changes/2026-09-23-yor-machine-audit.md).

## Goal

Rebuild Ayush Roy’s existing portfolio as an unmistakable, recruiter-friendly interactive machine world. The first visit introduces YOR as a spatial object; scrolling reveals engineering identity and six project worlds; project links carry the visitor into clear, evidence-grounded case studies; the contact finale resolves the experience.

The design should feel ambitious and cinematic while keeping every essential fact, route, link, and action usable without WebGL.

## Audience and success criteria

The primary audience is recruiters and engineers who need to understand Ayush’s engineering identity, scan six selected systems, inspect the supporting evidence, and reach a resume or contact path quickly.

The first 5–10 seconds should create a striking sense of arrival; the next moments should make the spatial experience legible as an engineering portfolio. The rebuild is successful when:

1. The first viewport is nearly black and presents a very large architectural `YOR`, a quiet identity marker, a distinctive machine core, and only the three primary actions: Explore Work, Resume, and GitHub.
2. One scroll-led environment carries the visitor from identity through the projects, About, and contact. Camera movement, project activation, lighting, and DOM copy share one centrally owned experience state.
3. The six projects appear in this display order: CandidateX, Zenith, Helios, AI vs Real, Yor Talks, Portfolio. Each has a distinct, engineered visual metaphor and an equivalent accessible DOM link and description.
4. Selecting or focusing a project activates its visual state. Opening a project keeps browser history, direct deep links, refresh, and fast navigation reliable; visual transitions never gate navigation.
5. Case studies remain approximately 80% semantic HTML and 20% optional scene enhancement, with large repository-authored visuals, readable evidence, contribution boundaries, limitations, and source/live actions.
6. The design works at all required viewport sizes, honors reduced motion, and keeps navigation and essential content usable with keyboard, touch, and screen readers.
7. All canonical routes, legacy redirects, project resolvers, metadata, sitemap, robots, structured data, and factual content remain valid.

## Locked product principles

- The approved visual direction is `YOR // THE MACHINE`: engineered, restrained, cinematic, and specific to this portfolio.
- Start from the requested balance of roughly 85% near-black/graphite, 10% titanium/warm white, and 5% signal red. Initial color tokens are Void `#030304`, Graphite `#08090B`, Titanium `#D7D7D2`, Paper `#EFEDE7`, Muted `#77787D`, Signal `#FF1728`, and Deep Red `#5D0710`; refine them during visual review while retaining the balance. Red is reserved for state, focus, energy, transition moments, and important actions.
- The experience must not resemble a dashboard, a generic card portfolio, a WebGL tutorial, a neon planet, or a cyberpunk HUD.
- The user’s 23 Sep directive and the current repository are the content sources of truth. Do not invent users, revenue, performance numbers, model accuracy, latency, production scale, deployment status, job titles, companies, or certifications.
- Preserve the prior project-system boundary: six canonical recruiter projects; experimental work stays on `/lab`; employment and education facts remain on the existing `/resume` route and are not promoted into the six project worlds. Keep those verified resume facts intact while restyling the page.
- CandidateX’s 28,800 submitted-paper benchmark and separate 4,800-sample repository ablation remain distinct and synthetic. Neither implies real-world hiring validity.
- AI vs Real’s 78.5% result stays bound to its repository-stated 107-image holdout. Helios remains a public frontend demo, not a hosted backend. Zenith remains experimental and assumption-bound. Yor Talks remains deployment-blocked unless repository evidence changes.
- No autoplay audio, hover-only controls, arbitrary metrics, decorative terminal, meaningless charts, or unnecessary package additions.

## Experience and visual system

### Arrival and machine core

The initial state uses a void-black field with minimal copy: `AYUSH ROY / PRODUCT ENGINEER / 2026`, the oversized `YOR` wordmark, and the machine core. Display type uses a contemporary system grotesk/sans stack with strong weight, tight spacing, deliberate cropping, and responsive sizes that can exceed 300px on wide screens. Monospace is reserved for genuinely technical metadata.

The core is a designed mechanical structure made from layered dark titanium forms, smoked/translucent surfaces, a selective red inner signal, and precise highlights. It must not reuse the current icosahedron plus torus rings as its final form. Use procedural geometry already supported by Three.js and React Three Fiber. Keep the geometry intentional and sparse.

The hero statement is `I BUILD SYSTEMS / THAT MOVE.` Supporting copy is `FULL STACK • AI SYSTEMS • INTERACTIVE 3D`. The three primary links are Explore Work, Resume, and GitHub. Location/status may appear as secondary copy.

### Scroll narrative and project worlds

Scroll is a continuous progression through one environment. The YOR letters separate, camera depth increases, the machine opens, project objects enter focus, and the identity/contact copy changes position or opacity with the same timeline. Do not create a set of unrelated animated section entrances.

The project navigation is an editorial list with oversized type and visible numbering. The presentation order is independent from the registry’s historical `index` values; the registry records remain authoritative and unchanged unless validation requires a non-semantic ordering update.

Each active project has its own visual language:

- **CandidateX:** evidence graph, provenance paths, scoring layers, and structured data streams.
- **Zenith:** solar lattice, architectural panel rows, and restrained irradiance paths.
- **Helios:** a telemetry ribbon or waveform with a focused anomaly pulse.
- **AI vs Real:** image planes, texture-feature fragments, and a classification boundary.
- **Yor Talks:** distributed message nodes and a small, legible connection topology.
- **Portfolio:** the machine’s own parts resolve into the system the visitor has navigated.

Project hover, keyboard focus, and touch selection must reach the same named state. Hover is an enhancement; focus and tap remain complete paths.

A subtle desktop cursor may expose clear states such as VIEW, OPEN, SOURCE, and LIVE where it helps explain an actual action. It must remain small, disappear on touch devices, respect reduced motion, and never replace the native cursor as the only affordance.

### About, Lab, and contact

About is large type, one concise positioning paragraph, and selected verified identity facts. The Lab remains a secondary gateway to explicitly experimental concepts. The finale returns the environment toward the core and presents `LET'S BUILD / SOMETHING / THAT SHOULDN'T / BE BORING.` with email, GitHub, LinkedIn, and Resume links.

The primary nav remains minimal: YOR, Work, About, Lab, Resume. It may compress after scroll but must stay predictable and visible.

## Application and rendering architecture

### Server-rendered content boundary

The App Router layout remains a Server Component for metadata, JSON-LD, navigation shell, and page content. The homepage, project index, and case studies continue to render their essential copy, headings, links, project status, and evidence in the DOM. Client components receive serializable project data and own only the required interaction.

### One persistent experience Canvas

Introduce one typed experience provider/director and one dynamically loaded React Three Fiber Canvas shared across `/`, `/projects`, and `/projects/[slug]`. The root layout stays server-rendered; the experience layer is a narrow client boundary that receives the server-rendered route content as children. It retains the same Canvas during eligible client-side transitions among those recruiter surfaces.

The Canvas is absent from `/resume` and `/lab`, and it is not mounted for reduced-motion users. It loads after the document’s primary content has rendered and the browser is idle. A static composition remains visible before initialization and if WebGPU/WebGL is unavailable or fails.

Use a typed state model with one owner, for example:

```ts
type ProjectId = "candidatex" | "zenith" | "helios" | "ai-vs-real" | "talks" | "portfolio";
type HomeSection = "intro" | "identity" | "projects" | "about" | "contact";
type ExperienceState =
  | { kind: "home"; section: HomeSection; progress: number; activeProject?: ProjectId }
  | { kind: "project-index"; activeProject?: ProjectId }
  | { kind: "case-study"; projectId: ProjectId; section: string }
  | { kind: "inactive" };
```

One experience director owns the scroll timeline, pathname, current section, active project, viewport/device quality, reduced-motion preference, and page visibility. DOM sections publish semantic experience markers. Use a single Motion scroll value or equivalent centralized observer; individual sections and objects must not independently read raw scroll position. Three.js frame updates use delta-time damping. Hidden tabs pause rendering.

The six project links remain native Next links or anchors. Focus/hover/tap updates the active project. A click starts the visual transition and route navigation together; the route must not wait for a cinematic timeout. View Transitions may enhance the transition where supported, with a normal navigation fallback.

### Project-specific rendering and case studies

The shared scene contains one core and project-specific object groups. Prefer shared materials, instancing, bounded geometry, and selective lighting over particles or repeated per-project canvases. The six projects must not share one generic floating sphere.

Case-study interactions update the shared scene state when the Canvas is active. Remove or repurpose the separately mounted `ProjectDemo` Canvas so the recruiter route family uses one persistent renderer. Keep semantic case-study text and repository diagrams/images available if JavaScript, WebGPU, and WebGL are disabled.

## Motion, quality, and responsive behavior

Motion durations should generally stay within the provided ranges: micro interaction 150–250ms, hover focus 250–450ms, section transition 600–900ms, cinematic transition 900–1400ms. Use CSS for typography/layout transitions, Motion for the centralized scroll/DOM state where it provides value, and `THREE.MathUtils.damp` or equivalent for frame-based scene motion. Avoid spring spam, overshoot, ambient constant rotation, or movement without state meaning.

Quality selection considers device class, viewport, DPR, reduced motion, GPU capability where available, and page visibility. Cap DPR, reduce geometry/lighting on touch and low-capability devices, and use a static composition for reduced motion or renderer failure. Audit JavaScript and Three.js transfer size, initial loading, LCP, layout shifts, scene initialization, and shader compilation where the available environment can measure them. The 60 FPS desktop goal is a target to evaluate on representative hardware, never an unmeasured claim.

Design and inspect at: 375×812, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1728×1117, 1920×1080, and 2560×1440. Mobile interactions cannot depend on hover; typography, controls, and layout must be deliberately composed for small screens.

## Accessibility and SEO

- Every route uses semantic landmarks, a skip link, a single clear page heading, keyboard navigation, visible focus, and useful link names.
- Project list rows are native links or buttons with accessible names; selection is conveyed without relying on color or hover. Every scene state has a DOM equivalent.
- Reduced motion disables WebGL animation and route choreography and preserves a polished static composition.
- Repository visuals retain descriptive alternative text and captions that distinguish artwork/diagrams from live product captures.
- Preserve canonical URLs, metadata, Open Graph/Twitter metadata, sitemap, robots, Person JSON-LD, source/live resolvers, legacy redirects, and security headers.
- Declare the existing repository-authored favicon asset in page metadata and verify that browsers load the intended icon without a `/favicon.ico` 404; the live baseline currently has `public/favicon.svg` but no icon link.

## CSS and asset architecture

Replace the current large global stylesheet plus override layer with explicit layers for design tokens, reset/base, typography, layout, motion, utilities, components, and the machine experience. Remove dead styles only after the replacement has been rendered and the corresponding route remains correct. Keep focus and reduced-motion rules near the motion/component styles they govern.

Reuse the current checked-in repository-authored SVG diagrams and product artwork. Enlarge the most useful evidence in case studies. New machine art is procedural geometry or authored code; do not use stock product screenshots or present concept art as a live capture. Keep the existing local asset budget or document a measured, justified change.

Keep the implementation in maintainable TypeScript components with clear ownership, predictable animation lifecycles, and resource cleanup. Avoid a monolithic client component, uncontrolled global state, unnecessary client boundaries, and new packages without a concrete need.

## Routes and project truth

Preserve these routes and behavior:

```text
/
/lab
/resume
/projects
/projects/portfolio
/projects/helios
/projects/zenith
/projects/ai-vs-real
/projects/talks
/projects/candidatex
/projects/[slug]/source
/projects/[slug]/live
/work/[slug]
```

Do not remove or weaken legacy redirects, source/live resolvers, canonical metadata, or unknown-project 404 behavior. Keep registry validation and content tests as the authority for the six-project set.

## Validation and release criteria

The implementation will add/adjust automated coverage for registry display integrity, route existence, source/live resolver behavior, navigation and route transitions, keyboard/focus semantics, reduced motion, direct deep links, browser history, and no hover-only interactions.

Implementation follows reviewable visual milestones: machine foundation, hero, project world, project selection/transitions, case studies, then About/contact and the secondary Lab/resume experience. At each major milestone, run the site, inspect screenshots, test interactions and responsive behavior, measure available performance signals, fix issues, and repeat before moving on. Give the most attention to arrival, first scroll into the machine, project selection, project transition, and the contact resolution.

The cross-platform browser QA runner must work from this Windows environment and run the ten specified viewports. It must check all canonical recruiter routes, project source/live resolver destinations without following off-site URLs unnecessarily, missing assets including the site icon, browser/console errors, no horizontal overflow, keyboard navigation, mobile menu, reduced motion, route refresh, and screenshot output. Its intentional 404 check must not be reported as an unexpected console failure.

Before release, run the project’s existing validation scripts (equivalents may use the available package runner): tests, lint, typecheck, content validation, asset validation, and production build. Inspect screenshots for desktop hero, desktop project world, project case study, mobile hero, mobile project world, and contact finale. Reopen and audit the production-equivalent build. Report measured results separately from targets and preserve any remaining limitation.

The final handoff includes the source branch and commit, major created/removed/rewritten files, test/build results, remaining limits, and the six requested screenshots.
