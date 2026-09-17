# YOR — Ayush Roy Portfolio

The personal universe of Ayush Roy: a polished portfolio and playground for products, experiments, games, and recorded moments.

The portfolio deployment is served from `https://yorayriniwnl.in`. The six recruiter-facing project routes live inside that existing site under `/projects`; `NEXT_PUBLIC_SITE_URL` keeps generated metadata and sitemap URLs aligned with the custom domain.

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

For canonical metadata and sitemap generation, set `NEXT_PUBLIC_SITE_URL=https://yorayriniwnl.in` in deployment. Development falls back to `http://localhost:3000`; a non-Vercel production build requires an explicit origin.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run validate
npm run build
```

GitHub Actions runs tests, lint, content, asset, typecheck, and production-build checks on pushes and pull requests (`.github/workflows/ci.yml`) with a non-production placeholder origin. Set `NEXT_PUBLIC_SITE_URL=https://yorayriniwnl.in` in the deployment environment.

Routes:

- `/` : the YOR homepage with the project collection, arcade, YouTube wall, about section, and contact CTA
- `/resume` : résumé and professional profile
- `/projects` : recruiter-facing index containing only the six CV projects
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
- `/projects/candidatex`

The portfolio, the bounded Helios frontend demo, Zenith, the bounded AI detector inference demo, and CandidateX have verified public live mappings. Yor Talks intentionally remains unavailable because its current full-stack runtime still needs long-lived Socket.IO infrastructure, database/Redis providers, secrets, and hosted acceptance checks.

Current public surfaces:

- Portfolio: `https://yorayriniwnl.in` — this repository's Next.js deployment and permanent public origin.
- Helios: `https://yor-helios-demo.vercel.app` — the repository's frontend demo only; the FastAPI/WebSocket backend is not hosted here.
- Zenith: `https://zenith-xi-snowy.vercel.app` — the existing reachable project deployment.
- AI vs. Real: `https://yor-ai-vs-real-detector.vercel.app` — the repository's Flask inference demo with checked-in model artifacts.
- Yor Talks: no live URL exposed; the source resolver remains available.
- CandidateX: `https://candidatex-smoky.vercel.app` — the public CandidateX application entry point; source resolves to `https://github.com/yorayriniwnl/CandidateX`.

The homepage arcade includes local two-player chess with legal move validation, promotion, undo, board flipping, and checkmate detection; a matching-pairs memory game; and a timed typing challenge. The YouTube wall is a curated set of real videos from [@YorAyriniwnl](https://www.youtube.com/@YorAyriniwnl), with direct links and inline playback.

## Content and evidence

The five original project records remain in `src/content/projects.ts`, while CandidateX is defined in `src/content/candidatex.ts` and combined into the six-project public registry in `src/content/project-registry.ts`. Quantitative claims that need an evidence record live in `src/content/claims.ts`, where each item records its method, date, and evidence URL. Case studies render those claims beside the relevant boundary instead of repeating unsupported badges. External repositories remain the source of truth; this site does not claim a public deployment when one has not been verified.

The Yor Talks case study also includes a keyboard-operable path explorer. Each boundary exposes its responsibility, failure mode, design decision, test surface, source location, and repository evidence link.

Case studies also show the strongest code-authored visuals from their public repositories: architecture diagrams, dashboard states, alert flows, mobile evidence, and model pipelines. Each image is copied locally, tied to a pinned source commit, captioned as visual explanation, and linked back to the exact GitHub asset. The portfolio does not copy ambiguous stock photos or raw dataset images.

The homepage keeps the recruiter path clear while making the playful work discoverable through the Arcade and Watch sections.

## Evidence policy

Cinematic artwork introduces each project. Repository-grounded outcomes retain explicit evidence scopes and limitations. No employer is inferred from the public "Associate Engineer" title.
