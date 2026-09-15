# YOR — Ayush Roy Portfolio

The personal universe of Ayush Roy: a polished portfolio and playground for products, experiments, games, and recorded moments.

Live site: [yorayriniwnl.in](https://yorayriniwnl.in)

## Stack

- Next.js 16.3.4 / React 19.2.8
- TypeScript
- React Three Fiber 9.7.0
- Three.js 0.185.1
- Motion 13.2.0
- chess.js 1.4.0
- CSS modules, design tokens, and semantic HTML

## Run

```bash
npm install
npm run validate:content
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run validate
npm run build
```

GitHub Actions runs the same lint, content, asset, typecheck, and production-build checks on pushes and pull requests (`.github/workflows/ci.yml`).

Routes:

- `/` : the YOR homepage with the project collection, arcade, YouTube wall, about section, and contact CTA
- `/resume` : résumé and professional profile
- `/work/[slug]` : source-linked case studies for the five featured projects

The homepage arcade includes local two-player chess with legal move validation, promotion, undo, board flipping, and checkmate detection; a matching-pairs memory game; and a timed typing challenge. The YouTube wall is a curated set of real videos from [@YorAyriniwnl](https://www.youtube.com/@YorAyriniwnl), with direct links and inline playback.

## Content and evidence

Project facts live in `src/content/projects.ts`. Quantitative and status claims live in `src/content/claims.ts`, where each item records its method, date, and evidence URL. Case studies render those claims beside the relevant boundary instead of repeating unsupported badges. External repositories remain the source of truth; this site does not claim a public deployment when one has not been verified.

The Yor Talks case study also includes a keyboard-operable path explorer. Each boundary exposes its responsibility, failure mode, design decision, test surface, source location, and repository evidence link.

Case studies also show the strongest code-authored visuals from their public repositories: architecture diagrams, dashboard states, alert flows, mobile evidence, and model pipelines. Each image is copied locally, tied to a pinned source commit, captioned as visual explanation, and linked back to the exact GitHub asset. The portfolio does not copy ambiguous stock photos or raw dataset images.

The homepage keeps the recruiter path clear while making the playful work discoverable through the Arcade and Watch sections.

## Evidence policy

Cinematic artwork introduces each project. Repository-grounded outcomes retain explicit evidence scopes and limitations. No employer is inferred from the public "Associate Engineer" title.
