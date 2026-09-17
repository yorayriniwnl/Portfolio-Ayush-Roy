# Portfolio Production Rebuild Implementation Plan

> **For agentic workers:** Execute task-by-task with TDD and verification. This workspace is an extracted checkpoint, so no live branch is modified.

**Goal:** Deliver the approved production hardening and signature 3D/motion rebuild without weakening evidence integrity or recruiter usability.

**Architecture:** Server-render static professional content, isolate expensive Three.js and interaction into client islands, centralize canonical project facts, and move experiments to `/lab`. Add browser QA and accessibility checks before final visual polish.

**Tech Stack:** Next.js 16.3.4, React 19.2, TypeScript, React Three Fiber 9.7, Three.js 0.185, CSS, Node test runner, Playwright-compatible Chromium.

**Spec:** `docs/superpowers/specs/2026-09-18-portfolio-production-rebuild-design.md`

## Global constraints
- Ignore KPIT/employment content during this work.
- CandidateX live means verified public frontend/research demo only, not verified backend/SLO.
- Preserve paper 28,800 vs supplementary 4,800 distinction.
- Never fabricate metrics or deployment capabilities.
- Normal browser scrolling remains intact.
- Reduced motion must produce a polished static composition.

---

### Task 1: Restore truthful green tests
**Files:** `tests/project-system.test.ts`, `tests/project-index.test.ts`, `tests/candidatex-paper-alignment.test.ts`, `src/content/candidatex.ts`
- [ ] Run current suite and capture the three expected failures.
- [ ] Update stale CandidateX route/index expectations to verified demo behavior.
- [ ] Relax paper-alignment assertion to test semantic real-world-validation boundary rather than one exact phrase.
- [ ] Run suite and confirm all tests pass.

### Task 2: Make project registry genuinely canonical
**Files:** `src/content/projects.ts`, `src/content/project-registry.ts`, `scripts/validate-content.mjs`, tests
- [ ] Add/adjust failing tests that forbid five→six string surgery and duplicate canonical slug lists.
- [ ] Move all canonical project-count facts to derived registry values.
- [ ] Remove duplicate/mutating compatibility logic.
- [ ] Make validation consume canonical project data rather than a second list.
- [ ] Verify tests/content validation.

### Task 3: Remove dead architecture and dependencies
**Files:** `src/components/Universe*`, `package.json`, `next.config.ts`, `scripts/validate-content.mjs`
- [ ] Add/adjust structural validation if needed.
- [ ] Remove unused Universe code, `motion`, and `chess.js` if confirmed unused.
- [ ] Clean optimizePackageImports/surface checks.
- [ ] Reinstall lockfile and verify lint/typecheck/build.

### Task 4: Split homepage server/client boundary and isolate 3D
**Files:** `src/app/page.tsx`, `src/components/Home*`, `src/components/HeroScene*`, CSS, tests
- [ ] Add source-structure test asserting homepage shell is server-side and hero scene is dynamically isolated.
- [ ] Refactor static sections to server-rendered components.
- [ ] Create a focused `HeroSceneIsland` client component using dynamic import.
- [ ] Preserve fallback, reduced-motion, visibility pause and adaptive DPR.
- [ ] Build and compare chunk graph against checkpoint baseline.

### Task 5: Separate experimental YOR lab from recruiter path
**Files:** `src/app/lab/page.tsx`, `src/content/hub.ts`, `src/components/Home*`, navigation, metadata/tests
- [ ] Add failing route/navigation/content tests.
- [ ] Move conceptual games/video wall off the homepage into `/lab` with honest statuses.
- [ ] Keep a compact optional Lab gateway after professional content.
- [ ] Verify sitemap/nav behavior.

### Task 6: Build CandidateX bespoke visual system
**Files:** `public/media/github/candidatex/*.svg`, `src/content/candidatex.ts`, tests
- [ ] Add failing media/provenance test for required CandidateX assets.
- [ ] Create hero, architecture, evidence-graph, recruiter-dossier and research-boundary SVGs.
- [ ] Wire media into CandidateX case study with accurate alt/captions/source references.
- [ ] Validate assets and render locally.

### Task 7: Upgrade motion and 3D visual system
**Files:** `HeroScene.tsx`, scene helpers, `globals.css`, project/home components
- [ ] Add tests for reduced-motion/static fallback contracts where feasible.
- [ ] Add restrained project-aware scene states, depth/motion tokens and section micro-interactions.
- [ ] Keep mobile quality tiers and normal scroll.
- [ ] Verify no unnecessary client hydration returns.

### Task 8: SEO, resume interaction, and security hardening
**Files:** `layout.tsx`, metadata content, `resume/page.tsx`, `next.config.ts`, tests
- [ ] Add metadata/security behavior tests.
- [ ] Rewrite root metadata around Ayush Roy + professional identity while retaining YOR branding.
- [ ] Fix PDF action semantics without altering employment/KPIT content.
- [ ] Add tested CSP compatible with current local assets/Three.js runtime.
- [ ] Verify canonical/sitemap/robots.

### Task 9: Browser QA and accessibility
**Files:** `package.json`, browser tests/config, components/CSS
- [ ] Install browser-test dependencies compatible with available Chromium.
- [ ] Add tests for homepage/projects/CandidateX/resume, mobile menu, Escape, keyboard/focus, reduced motion, console errors, 404, and horizontal overflow.
- [ ] Run at 1440/1366/768/390/360/320.
- [ ] Fix every material issue discovered.

### Task 10: Final audit loop
- [ ] Run full `npm run validate`.
- [ ] Run browser suite and screenshot audit.
- [ ] Re-measure build/chunk output.
- [ ] Search for stale five-project copy, placeholder language, dead imports, TODOs and console noise.
- [ ] Repeat fixes until all locally verifiable gates pass.
- [ ] Package the verified rebuilt source for handoff.
