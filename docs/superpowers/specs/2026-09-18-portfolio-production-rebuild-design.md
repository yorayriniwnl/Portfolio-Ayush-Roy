# Portfolio Production Rebuild Design

## Goal
Turn the existing YOR portfolio into a production-grade recruiter-facing engineering site with a signature, progressively enhanced Three.js/WebGPU identity, while preserving evidence integrity and fast conventional navigation.

## Locked product principles
- Professional engineering signal comes before experimental/creator content.
- Motion and 3D must reinforce hierarchy and project identity, never block navigation.
- Server Components own static content; client islands own interaction.
- CandidateX is a verified public frontend/research-demo deployment, not a verified production backend.
- CandidateX synthetic paper benchmark (28,800 candidate-role evaluations) and supplementary 4,800-sample implementation ablation remain explicitly distinct.
- KPIT/employment content is out of scope for this rebuild and must not be added or modified except to remove accidental dependency on it.
- Six canonical projects are the only recruiter-facing project set and all counts derive from the canonical registry.
- Existing safe external-link resolution, evidence provenance and reduced-motion behavior must be preserved or strengthened.

## Architecture
The homepage becomes a server-rendered shell with isolated client islands. The hero uses a lazily loaded adaptive Three.js scene with WebGPU/WebGL/static fallbacks. The primary recruiter path contains identity, evidence, projects, engineering approach, about/contact; experimental games/media move to `/lab`.

Case studies remain data-driven. CandidateX receives a bespoke SVG media family and a clearer research/evidence boundary. Browser-level tests cover recruiter journeys, mobile navigation, accessibility and motion preferences.

## Quality gates
`npm run test`, lint, content validation, asset validation, typecheck and production build must pass. Browser QA must cover 1440, 1366, 768, 390, 360 and 320 widths with no console errors or material horizontal overflow. Reduced-motion must avoid animated WebGL/WebGPU work. Performance changes are measured from build outputs and browser traces available locally; no fabricated Lighthouse scores.
