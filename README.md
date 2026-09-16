# YOR — Ayush Roy Portfolio

The personal universe of Ayush Roy: a polished portfolio and playground for products, experiments, games, and recorded moments.

The portfolio deployment origin is configured with `NEXT_PUBLIC_SITE_URL`. The `yorayriniwnl.in` domain is a separate website and is not used as this repository's live or canonical URL.

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

For canonical metadata and sitemap generation, set `NEXT_PUBLIC_SITE_URL` to the host serving this repository. Development falls back to `http://localhost:3000`; production requires the variable.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run validate
npm run build
```

GitHub Actions runs tests, lint, content, asset, typecheck, and production-build checks on pushes and pull requests (`.github/workflows/ci.yml`) with a non-production placeholder origin. Set the real portfolio origin in the deployment environment.

Routes:

- `/` : the YOR homepage with the project collection, arcade, YouTube wall, about section, and contact CTA
- `/resume` : résumé and professional profile
- `/projects` : recruiter-facing index containing only the five CV projects
- `/projects/[slug]` : canonical engineering case study
- `/projects/[slug]/live` : verified deployment resolver, or an honest unavailable state
- `/projects/[slug]/source` : stable source-repository resolver
- `/work/[slug]` : legacy compatibility route; CV project slugs permanently redirect to `/projects/[slug]`

Canonical CV project URLs:

- `/projects/portfolio`
- `/projects/helios`
- `/projects/zenith`
- `/projects/ai-vs-real`
- `/projects/talks`

The portfolio, the bounded Helios frontend demo, Zenith, and the bounded AI detector inference demo have verified reachable mappings. Yor Talks intentionally remains unavailable because its current full-stack runtime still needs long-lived Socket.IO infrastructure, database/Redis providers, secrets, and hosted acceptance checks.

Current public surfaces:

- Portfolio: `https://ayush-roy-portfolio.vercel.app` — this repository's Next.js deployment.
- Helios: `https://yor-helios-demo.vercel.app` — the repository's frontend demo only; the FastAPI/WebSocket backend is not hosted here.
- Zenith: `https://zenith-xi-snowy.vercel.app` — the existing reachable project deployment.
- AI vs. Real: `https://yor-ai-vs-real-detector.vercel.app` — the repository's Flask inference demo with checked-in model artifacts.
- Yor Talks: no live URL exposed; the source resolver remains available.

The homepage arcade includes local two-player chess with legal move validation, promotion, undo, board flipping, and checkmate detection; a matching-pairs memory game; and a timed typing challenge. The YouTube wall is a curated set of real videos from [@YorAyriniwnl](https://www.youtube.com/@YorAyriniwnl), with direct links and inline playback.

## Content and evidence

Project facts, status, visibility, availability, metrics, and section copy live in `src/content/projects.ts`. Quantitative claims that need an evidence record also live in `src/content/claims.ts`, where each item records its method, date, and evidence URL. Case studies render those claims beside the relevant boundary instead of repeating unsupported badges. External repositories remain the source of truth; this site does not claim a public deployment when one has not been verified.

The Yor Talks case study also includes a keyboard-operable path explorer. Each boundary exposes its responsibility, failure mode, design decision, test surface, source location, and repository evidence link.

Case studies also show the strongest code-authored visuals from their public repositories: architecture diagrams, dashboard states, alert flows, mobile evidence, and model pipelines. Each image is copied locally, tied to a pinned source commit, captioned as visual explanation, and linked back to the exact GitHub asset. The portfolio does not copy ambiguous stock photos or raw dataset images.

The homepage keeps the recruiter path clear while making the playful work discoverable through the Arcade and Watch sections.

## Evidence policy

Cinematic artwork introduces each project. Repository-grounded outcomes retain explicit evidence scopes and limitations. No employer is inferred from the public "Associate Engineer" title.
