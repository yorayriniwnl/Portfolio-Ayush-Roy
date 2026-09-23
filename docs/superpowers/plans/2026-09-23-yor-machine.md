# YOR // THE MACHINE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Rebuild the portfolio as a distinctive, recruiter-friendly machine world while preserving verified content, routes, evidence, accessibility, and a complete static experience.

**Architecture:** Keep the App Router layout and route content server-rendered. Add one typed client experience runtime that owns route, section, project, preference, and scene state. One lazily loaded React Three Fiber Canvas persists across `/`, `/projects`, and canonical case studies, with a visible static composition as baseline and fallback. Native DOM content and links remain complete and independently usable.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Three.js 0.185 WebGPU renderer with its WebGL 2 path, React Three Fiber 9, Motion 13 where centralized DOM scroll handling needs it, CSS cascade layers, Node test runner, and the existing Chrome DevTools Protocol browser runner.

**Spec:** `docs/superpowers/specs/2026-09-23-yor-machine-design.md`

## Global Constraints

- The approved visual direction is `YOR // THE MACHINE`: engineered, restrained, cinematic, and specific to this portfolio.
- Start from the requested balance of roughly 85% near-black/graphite, 10% titanium/warm white, and 5% signal red. Initial color tokens are Void `#030304`, Graphite `#08090B`, Titanium `#D7D7D2`, Paper `#EFEDE7`, Muted `#77787D`, Signal `#FF1728`, and Deep Red `#5D0710`; refine them during visual review while retaining the balance. Red is reserved for state, focus, energy, transition moments, and important actions.
- The six projects appear in this display order: CandidateX, Zenith, Helios, AI vs Real, Yor Talks, Portfolio.
- Do not invent users, revenue, performance numbers, model accuracy, latency, production scale, deployment status, job titles, companies, or certifications.
- CandidateX’s 28,800 submitted-paper benchmark and separate 4,800-sample repository ablation remain distinct and synthetic. Neither implies real-world hiring validity.
- AI vs Real’s 78.5% result stays bound to its repository-stated 107-image holdout. Helios remains a public frontend demo, not a hosted backend. Zenith remains experimental and assumption-bound. Yor Talks remains deployment-blocked unless repository evidence changes.
- The experience Canvas is shared by `/`, `/projects`, and `/projects/[slug]`; it is absent from `/resume`, `/lab`, and reduced-motion mode.
- No autoplay audio, hover-only controls, arbitrary metrics, decorative terminal, meaningless charts, or unnecessary package additions.
- Preserve the six canonical recruiter projects as the only project worlds; keep experiments on Lab and verified education/employment facts on Resume.
- Motion durations should generally stay within the provided ranges: micro interaction 150–250ms, hover focus 250–450ms, section transition 600–900ms, cinematic transition 900–1400ms.
- Design and inspect at: 375×812, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1728×1117, 1920×1080, and 2560×1440.
- Preserve these routes and behavior: `/`, `/lab`, `/resume`, `/projects`, all six `/projects/<slug>` case studies, `/projects/[slug]/source`, `/projects/[slug]/live`, and `/work/[slug]`.
- Reuse checked-in project visuals; keep the local asset budget or record a measured, justified change. Measure performance and report measured results separately from targets.

## Review Focus

1. **Reduced motion changes on an open recruiter route:** changing the browser setting removes Canvas, stops route choreography, and leaves DOM/static composition usable. Test lifecycle browser checks and `tests/experience-state.test.ts`.
2. **WebGPU/WebGL initialization failure:** unsupported APIs, rejected initialization, and scene exceptions leave static composition visible without hiding content or producing uncaught app errors. Test `tests/scene-quality.test.ts` and renderer-failure browser checks.
3. **Deep links and browser history:** refreshing each case study and moving back/forward across recruiter routes keeps the right project selected and normal navigation. Test the all-route matrix and history scenario.
4. **Narrow screens, clipped copy, keyboard/touch selection:** headings and essential text fit all ten widths inside overflow-hidden ancestors; activation works without hover and controls retain visible focus. Test clipping probes, keyboard traversal, and mobile touch.
5. **Offscreen scenes, hidden tabs, lazy evidence:** hidden/offscreen scenes stop rendering, gallery images decode after scrolling into view, and route changes release listeners, observers, and renderer resources. Test visibility, gallery decode, and repeated navigation.

---

## Repository Map and Ownership

- `src/experience/experience-state.ts` owns serializable state, route classification, and the pure reducer; it has no DOM, Three.js, or Next imports.
- `src/experience/ExperienceProvider.tsx`, `ExperienceDirector.tsx`, and `ExperienceRuntime.tsx` own client state, preferences, route changes, and centralized scroll/section observation. `src/app/layout.tsx` remains a Server Component.
- `src/experience/ExperienceSceneLayer.tsx`, `MachineCanvas.tsx`, `MachineWorld.tsx`, `MachineCore.tsx`, `StaticMachine.tsx`, and `worlds/*` own the persistent Canvas, fallback, geometry, renderer lifecycle, and project metaphors. Existing `src/components/sceneQuality.ts` remains the quality policy.
- `src/components/Home.tsx`, `ProjectIndex.tsx`, and `CaseStudy.tsx` remain server-rendered. Small components under `src/components/experience/` provide marked sections, project rows, and accessible controls.
- `src/components/experience/ProjectPreviewLink.tsx` is the narrow client boundary for project pointer, keyboard-focus, and touch selection; server-rendered parents continue to own the copy and links.
- `src/content/project-registry.ts` owns recruiter display order; project facts stay in existing content modules.
- `src/styles/tokens.css`, `src/app/globals.css`, `src/app/rebuild.css`, and new `src/styles/machine.css` own CSS migration. Remove legacy styles only after every retained route is covered.
- `scripts/browser-qa.mjs` and `scripts/cdp-qa-lib.mjs` own production-equivalent route, viewport, clipping, accessibility, image, history, renderer-failure, and screenshot checks.

## Task 1: Define and Test the Experience State Contract

**Files:**
- Create: `src/experience/experience-state.ts`
- Create: `tests/experience-state.test.ts`

**Interfaces:**
- Produces `ProjectId = "candidatex" | "zenith" | "helios" | "ai-vs-real" | "talks" | "portfolio"`; `HomeSection = "intro" | "identity" | "projects" | "about" | "contact"`; `ExperienceSurface`; `SceneStatus = "static" | "queued" | "ready" | "failed"`; `ExperienceState`; `ExperienceAction`; `createExperienceState(pathname)`; and `experienceReducer(state, action)`.
- Use `ExperienceSurface = "home" | "project-index" | "case-study" | "inactive"`. ExperienceState fields are pathname, surface, section, progress, optional projectId/activeProject, reducedMotion, pageVisible, quality, sceneStatus, and demo `{ choice: 0 | 1; selectedNode: number; run: number }`.
- ExperienceAction variants carry these exact payloads: `{ type: "route"; pathname: string }`, `{ type: "section"; section: string; progress: number }`, `{ type: "project"; projectId?: ProjectId }`, `{ type: "demo-choice"; choice: 0 | 1 }`, `{ type: "demo-run" }`, `{ type: "demo-node"; index: number }`, `{ type: "environment"; reducedMotion: boolean; pageVisible: boolean }`, `{ type: "quality"; quality: SceneQuality }`, and `{ type: "scene-status"; status: SceneStatus }`.
- `createExperienceState(pathname: string)` starts reduced motion as true, page visibility as true, quality as low, progress as zero, and scene status as static.
- Only `/`, `/projects`, and one-segment canonical `/projects/<slug>` routes are Canvas-eligible. Lab, resume, resolvers, unknown and nested routes are inactive; a case route carries its canonical ProjectId.

- [x] Test every route class and project ID, reduced-motion-safe initialization, progress clamping, project activation, demo actions, and environment/renderer transitions.
- [x] Run `node --import tsx --test tests/experience-state.test.ts` and confirm tests fail before the contract exists.
- [x] Implement explicit route mapping and pure reducer; reject noncanonical slugs instead of assigning a project.
- [x] Run `node --import tsx --test tests/experience-state.test.ts` and confirm all state tests pass.
- [x] Commit as `feat: define machine experience state`.

## Task 2: Establish Design Tokens, CSS Layers, and Favicon Metadata

**Files:**
- Modify: `src/styles/tokens.css`, `src/app/globals.css`, `src/app/rebuild.css`, `src/app/layout.tsx`, `tests/security-seo.test.ts`
- Create: `src/styles/machine.css`

**Interfaces:**
- Produces ordered CSS layers `reset, legacy, tokens, base, typography, layout, components, motion, experience`.
- Existing global/rebuild rules stay in the legacy layer until Task 8; new machine selectors live in named layers.
- Metadata explicitly declares checked-in `/favicon.svg` with MIME type `image/svg+xml`.

- [x] Add a metadata test asserting the root icon resolves to `/favicon.svg` with SVG MIME type.
- [x] Run `node --import tsx --test tests/security-seo.test.ts` and confirm the icon assertion fails first.
- [x] Add approved palette, font/spacing/motion tokens, layer order, legacy wrappers, and base/reset/focus/reduced-motion rules.
- [x] Declare the SVG icon in `src/app/layout.tsx` while preserving canonical, Open Graph, Twitter, Person JSON-LD, robots, and security metadata.
- [x] Run `node --import tsx --test tests/security-seo.test.ts` and `npm run typecheck`; confirm both pass.
- [x] Commit as `style: establish machine design layers`.

## Task 3: Add the Persistent Client Runtime and Central Director

**Files:**
- Create: `src/experience/ExperienceProvider.tsx`, `src/experience/ExperienceDirector.tsx`, `src/experience/ExperienceRuntime.tsx`
- Modify: `src/app/layout.tsx`, `tests/experience-state.test.ts`, `tests/home-architecture.test.ts`

**Interfaces:**
- `ExperienceProvider({ children })` exposes `useExperience(): { state: ExperienceState; setActiveProject(projectId?: ProjectId): void; setDemoChoice(choice: 0 | 1): void; runDemo(): void; selectDemoNode(index: number): void; setSceneStatus(status: SceneStatus): void }`.
- `ExperienceRuntime({ children })` mounts provider and exactly one director around SiteNav, Person JSON-LD, and route children without making root layout a Client Component.
- The director consumes `usePathname()`, tracks reduced motion, visibility and resize quality, and solely owns document scroll/progress. It observes `[data-experience-section]` markers and publishes state.
- Quality selection considers viewport, device class/touch, DPR, hardware concurrency, reduced motion, page visibility, and GPU capability where available; cap DPR and reduce geometry/lighting for touch and lower-capability devices.
- Remove listeners, observers, animation-frame callbacks, and media-query handlers on unmount. Initialize reduced motion true until the client preference is known.

- [x] Test that resume, Lab, resolver and unknown paths are inactive and case routes retain their project ID.
- [x] Run `node --import tsx --test tests/experience-state.test.ts` and confirm lifecycle cases fail before provider integration.
- [x] Implement provider actions, route sync, one progress reader, one marker observer, quality updates, and preference/visibility subscriptions.
- [x] Wrap persistent content with ExperienceRuntime from the Server Component layout; metadata and Person JSON-LD remain server-owned.
- [x] Run the state and home architecture tests plus `npm run typecheck`; confirm all pass.
- [x] Commit as `feat: add persistent experience runtime`.

## Task 4: Build the Shared Machine Scene and Static Composition

**Files:**
- Create: `src/experience/ExperienceSceneLayer.tsx`, `MachineCanvas.tsx`, `MachineWorld.tsx`, `MachineCore.tsx`, `StaticMachine.tsx`
- Create six files under `src/experience/worlds/`: CandidateXWorld, ZenithWorld, HeliosWorld, AiVsRealWorld, TalksWorld, PortfolioWorld
- Modify: `src/experience/ExperienceRuntime.tsx`, `src/components/sceneQuality.ts`, `tests/scene-quality.test.ts`
- Delete after replacement renders: `src/components/HeroScene.tsx` and `HeroSceneIsland.tsx`

**Interfaces:**
- ExperienceSceneLayer returns nothing on inactive routes. On eligible routes it renders the static composition immediately, then requests the dynamically loaded Canvas only after primary document render and an idle callback (timer fallback included).
- MachineCanvas consumes ExperienceState and is the only Canvas owner in the recruiter route family. It uses existing WebGPURenderer initialization and `renderer=webgl` test path, caps DPR through sceneQuality.ts, and reports ready/failure to the provider.
- Pause rendering on hidden tabs; never mount Canvas for reduced motion; retain static composition for reduced motion, before initialization, and after initialization failure.
- The final core uses sparse layered dark-titanium mechanical forms, smoked/translucent surfaces, selective red signal, and deliberate highlights; do not retain the current icosahedron plus torus rings as the final form.
- MachineWorld composes six distinct groups: CandidateX evidence/provenance/scoring graph; Zenith solar lattice and irradiance paths; Helios telemetry ribbon with anomaly pulse; AI vs Real image planes, texture fragments, and classification boundary; Yor Talks message-node topology; Portfolio resolving the machine's own parts.
- useFrame motion uses delta-time damping and state targets; no independent scroll reader, spring spam, or ambient constant rotation.
- StaticMachine is decorative and accessibility-hidden; names, selection and status stay in DOM controls.

- [x] Extend quality tests for small screens, DPR caps and low-capability tiers; assert one Canvas owner and separate static composition.
- [x] Run `node --import tsx --test tests/scene-quality.test.ts` and confirm new expectations fail.
- [x] Build static geometry/fallback, then delayed Canvas, error boundary, WebGL 2 test path, visibility pause, cleanup, and six visual metaphors from the approved spec.
- [x] Attach ExperienceSceneLayer to runtime and replace HeroSceneIsland without changing homepage copy yet.
- [x] Run scene-quality tests, typecheck and build; confirm reduced-motion markup contains no Canvas and renderer errors leave static layer visible.
- [x] Commit as `feat: add shared machine scene`.

## Task 5: Rebuild the Homepage Arrival and Scroll Narrative

**Files:**
- Modify: `src/components/Home.tsx`, `src/styles/machine.css`, `tests/home-architecture.test.ts`
- Modify: `src/app/globals.css`, `src/experience/ExperienceProvider.tsx`, `src/experience/MachineWorld.tsx`, `src/experience/MachineCore.tsx`
- Create: `src/components/experience/MachineHero.tsx`, `HomeProjectWorlds.tsx`, `HomeAbout.tsx`, `HomeContact.tsx`
- Create: `src/components/experience/MachineScrollBinding.tsx`
- Create: `src/components/experience/ProjectPreviewLink.tsx`

**Interfaces:**
- Home remains a Server Component and composes small server-rendered sections in document order.
- Identity, project, About, and contact sections have stable `data-experience-section` markers.
- Hero copy is the approved identity marker, `YOR`, `I BUILD SYSTEMS / THAT MOVE.`, and `FULL STACK • AI SYSTEMS • INTERACTIVE 3D`. Primary actions are Explore Work, Resume, and GitHub.
- One continuous scroll progression coordinates YOR letter separation, camera depth, opening core, project focus, and DOM copy through the same state; do not add unrelated section entrance animations.
- About uses large type, one concise positioning paragraph, and selected verified identity facts. The finale resolves the world toward the core and presents `LET'S BUILD / SOMETHING / THAT SHOULDN'T / BE BORING.` plus email, GitHub, LinkedIn, and Resume links.
- Focus, hover, and touch preview call provider `setActiveProject(projectId)`; clicking remains immediate native navigation.
- ProjectPreviewLink is a small Client Component receiving a canonical ProjectId, href, and server-rendered children; it owns only pointer/focus/touch handlers and active visual state.

- [x] Add server-rendered assertions for the three hero actions, required narrative sections, identity copy, and absence of the old hero Canvas.
- [x] Run `node --import tsx --test tests/home-architecture.test.ts` and confirm assertions fail on the old homepage.
- [x] Implement component composition, markers, project selection handlers, and responsive machine typography/layout.
- [x] Ensure YOR, hero statement, headings, and essential copy wrap rather than clip at 375×812, 390×844, and 430×932; do not rely on page-level overflow.
- [x] Run the home architecture test and typecheck; inspect desktop and mobile screenshots before committing.
- [x] Commit as `feat: rebuild machine homepage narrative`.

## Task 6: Reorder and Rebuild the Project Index

**Files:**
- Modify: `src/content/project-registry.ts`, `src/components/ProjectIndex.tsx`, `src/styles/machine.css`, `tests/project-index.test.ts`
- Reuse: `src/components/experience/ProjectPreviewLink.tsx` from Task 5 for all six rows.

**Interfaces:**
- `recruiterProjects` becomes CandidateX, Zenith, Helios, AI vs Real, Yor Talks, Portfolio. Registry slugs, facts, and historical index values remain unchanged.
- Project rows remain server-rendered native links with visible active state. Pointer enter, keyboard focus, touch selection, and click call `setActiveProject` with the row's ProjectId.
- Case/source/verified-live URLs and availability rules remain intact. Selection must be clear without hover or signal color alone.

- [x] Update tests to assert the exact six-project sequence, all case URLs, verified live/source actions, and correct resolver use.
- [x] Run `node --import tsx --test tests/project-index.test.ts` and confirm ordering fails against the current registry.
- [x] Change recruiter display order and rebuild the list as editorial oversized links with numbered metadata and focus/touch selection handlers.
- [x] Test selected labels and semantic names; preserve all factual metrics and status from the registry.
- [x] Run project-index and project-system tests plus typecheck; confirm all pass.
- [x] Commit as `feat: order projects as machine worlds`.

## Task 7: Integrate Shared Project Worlds with Semantic Case Studies

**Files:**
- Modify: `src/components/CaseStudy.tsx`, `ProjectGallery.tsx`, `src/experience/MachineCanvas.tsx`, `MachineWorld.tsx`, `src/experience/worlds/shared.tsx`, `ZenithWorld.tsx`, `HeliosWorld.tsx`, `AiVsRealWorld.tsx`, `TalksWorld.tsx`, `src/styles/machine.css`
- Create: `src/components/ProjectInteractionPanel.tsx`, `tests/case-study.test.ts`
- Delete after replacement: `src/components/ProjectDemo.tsx`, `src/components/DeferredProjectDemo.tsx`
- Reuse: the shared reducer, provider actions, and director established in Tasks 1 and 3.

**Interfaces:**
- CaseStudy remains server-rendered and marks its project and semantic sections for the director.
- Keep case studies approximately 80% semantic HTML and 20% optional scene enhancement. Headings, summaries, contribution boundaries, large repository visuals, readable evidence, gallery captions, limitations, source/live actions, and next links remain available without JavaScript or graphics APIs.
- `ProjectInteractionPanel({ project })` keeps deterministic demo controls as accessible DOM buttons; choices/run/node updates dispatch to the shared reducer and project world. It mounts no renderer.
- Gallery retains descriptive alternative text and captions; images stay lazy-loaded and decode after scroll.
- Case titles wrap responsively; no primary title is cropped at production widths.

- [x] Add static-render tests for all six studies: one h1; overview, contribution, architecture, testing, evidence, limitations; correct identity; no per-study Canvas.
- [x] Run `node --import tsx --test tests/case-study.test.ts` and confirm it fails while old per-study rendering remains.
- [x] Move demo actions into ProjectInteractionPanel, connect shared scene state, add project markers, preserve evidence/action URLs, and remove per-study Canvas.
- [x] Adjust gallery semantics and case typography while retaining repository-authored assets, captions, and lazy loading.
- [x] Run case-study and project SEO tests plus typecheck; confirm all pass.
- [x] Commit as `feat: connect case studies to shared worlds`.

## Task 8: Finish Navigation and Secondary Routes, Then Remove Legacy CSS

**Files:**
- Modify: `src/components/SiteNav.tsx`, `SiteNav.module.css`, `src/app/resume/page.tsx`, `src/components/Lab.tsx`, `src/styles/tokens.css`, `src/app/globals.css`, `src/app/rebuild.css`, `src/styles/machine.css`, `src/app/layout.tsx`, `tests/home-architecture.test.ts`, `tests/security-seo.test.ts`

**Interfaces:**
- Navigation exposes YOR, Work, About, Lab, and Resume with predictable mobile menu, skip link, visible focus, and useful names. Active state is semantic and not color-only.
- Resume retains all existing education, BSNL internship, role, selected work, PDF, email, and profile facts. Lab remains explicitly experimental and outside the Canvas route family.
- New CSS layers own every route, reduced motion, focus, navigation, ten viewport sizes, and overflow-safe case headings. Remove legacy global/rebuild styles after all retained routes migrate.
- Preserve metadata/security behavior; delete `src/app/rebuild.css` when no production selector depends on it.

- [x] Test resume facts, Lab separation, and the five navigation items.
- [x] Run home architecture and security/SEO tests to expose unfinished migration.
- [x] Restyle resume and Lab; keep mobile nav keyboard-operable with Escape/open/close focus behavior.
- [x] Search retained pages for legacy selectors, migrate remaining rules, remove old global/rebuild blocks and imports, then delete rebuild.css.
- [x] Run typecheck, lint, content validation, asset validation, and build; confirm all pass before visual release checks.
- [x] Commit as `style: complete machine route migration`.

## Task 9: Make Production Browser QA Portable and Audit the Full Experience

**Files:**
- Modify: `scripts/browser-qa.mjs`, `scripts/cdp-qa-lib.mjs`, `package.json`, `.gitignore`, `docs/changes/2026-09-23-yor-machine-audit.md`
- Create: `tests/browser-qa-contract.test.ts`
- Create at runtime: `artifacts/browser-qa/report.json` and screenshots

**Interfaces:**
- `npm run qa:browser` launches the already-built production server and a local Chromium-compatible browser. Support CHROMIUM_PATH, Windows Chrome/Edge discovery, and Unix discovery without invoking Unix-only `which` on Windows.
- The exact viewport list is 375×812, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900, 1728×1117, 1920×1080, and 2560×1440.
- Check home, project index, and all six canonical case studies at every viewport for page overflow, exactly one h1, clipped primary heading/essential copy, and required DOM content. Check source/live resolvers and `/work/[slug]` without navigating off-site.
- Clipping probes compare heading and `[data-essential-copy]` line rectangles against viewport edges and nearest overflow-clipping ancestors, even when body overflow is hidden. Intentional 404 is an expected outcome.
- Cover keyboard/focus, mobile menu and touch selection, live reduced-motion changes, refresh/history, WebGL 2 path, forced graphics failure, hidden/offscreen pause, gallery scroll/decode, favicon response, errors, and cleanup after repeated route changes.
- Measure JavaScript/Three.js transfer, initial loading, LCP, layout shifts, scene initialization, and shader compilation where available. Report measurements separately from goals; never state 60 FPS without representative hardware measurement.
- Save six review screenshots: desktop hero, desktop project world, desktop case study, mobile hero, mobile project world, and contact finale.

- [x] Add runner contract tests for viewport/route completeness, clipping probes, expected 404, Windows discovery, image decode, and screenshot names.
- [x] Run `node --import tsx --test tests/browser-qa-contract.test.ts` and confirm the new assertions fail.
- [x] Update process startup/shutdown and browser discovery for Windows and Unix; run against `next start` in the production validation path.
- [x] Implement route/viewport loops, clipping/accessibility checks, resolver/redirect assertions, preference/history scenarios, renderer fallback, visibility/lazy-image checks, and six screenshots.
- [x] Run the production build and browser QA; inspect report, errors, six screenshots, and the confirmed mobile title-clipping regressions.
- [x] Record the baseline CandidateX and Portfolio mobile clipping values, then confirm their headings and all essential copy fit in the production responsive matrix.
- [x] Run the full validation set and update the audit with test, lint, type, content, asset, build, route, viewport, and browser results. Report measurements separately from targets and record remaining limits.
- [x] Commit as `test: audit machine experience in production browser` and push the scoped commit.

## Completion Handoff

- Record implementation branch/commit, major files, validation results, measured performance versus targets, and remaining limits in the audit.
- Provide links to the six screenshots and final audit report.
- Confirm no Canvas on resume/Lab/reduced motion; DOM selection equivalents for all project worlds; intact source/live resolvers and legacy redirects; working favicon at `/favicon.svg`.
- [x] Complete the fresh whole-branch review after the Task 9 commit and address any required findings.
