# Branch integration and production audit — 2026-09-27

Baseline: `main` at `4eff7960f2f377ef4710de7353329cdf4dcb1462`.
Integration code: `823f907f9e1decce690581c02bcaae3a5f367d34`.

The supplied workspace was empty. There were no local uncommitted files to recover; this audit covers the seven remote branch tips available from GitHub.

## Branch reconciliation

| Branch | Original tip | Resolution |
| --- | --- | --- |
| `chatgpt/audit-20260917` | `b1011a8` | CandidateX and six-project work was superseded by the canonical registry and later evidence corrections on main. Preserve the newer implementation and reconcile the earlier history. Its ephemeral CI-trigger marker is intentionally not restored. |
| `feat/candidatex-project-route` | `40cdf22` | Tree exactly matches the already integrated main snapshot `e73b002`. |
| `feat/candidatex-live-link` | `69788a6` | Tree exactly matches the already integrated main snapshot `1404200`. |
| `portfolio-10x-rebuild-20260918` | `fba4dbc` | Tree exactly matches the already integrated main snapshot `53df148`. |
| `postmerge-registry-hardening-20260918` | `73f45a0` | Tree exactly matches the original main tip `4eff796`. |
| `rebuild/yor-machine-execution` | `bb4c871` | Merge the persistent scene, project worlds, route migration, lifecycle fixes, and expanded production QA. |
| `rebuild/yor-machine` | `e84a9f9` | Merge the cursor component and assets. Resolve the layout conflict by retaining both the experience runtime and cursor. |

The five already integrated/superseded branches are recorded by a history-only merge. The two active feature branches are content merges. Every original branch tip is an ancestor of the integration commit. Original remote branches are retained. CandidateX's separate 28,800 paper benchmark and 4,800 supplementary ablation, the six canonical slugs, original project records, and unavailable Yor Talks deployment remain intact.

## Findings and fixes

- **Linux text overflow:** the prior rebuild's [GitHub CI run](https://github.com/yorayriniwnl/Portfolio-Ayush-Roy/actions/runs/35893496083) failed with 87 heading-overflow findings despite a reported Windows pass. Headings now wrap long words within their containers, and the homepage heading grid can shrink. Fixed two references to an undefined typography token.
- **Invisible custom pointer:** native cursors were hidden before replacement images had loaded. Both assets must now decode before activation; image failure preserves the native pointer. Preference changes, text inputs, touch/pen input, viewport edges, and cleanup have explicit handling and browser coverage.
- **Persistent mobile menu:** navigation state could remain open across route/history changes or a home-logo click. Menu state now belongs to the current pathname, and the logo dismisses it even on the same route. Browser tests cover all three paths.
- **Stale scene callbacks:** queued scene resets now cancel when their route or motion conditions change, preventing an obsolete callback from resetting a newer scene request.
- **Redirect validation:** credential-bearing URLs and alternate localhost spellings could pass the destination guard. Reject them and cover the malformed configurations with behavioral regression tests.
- **Unbounded browser commands:** CDP requests could wait forever after a stalled/disconnected Chromium session. Commands now time out, reject on disconnection/close, and release pending timers. Three behavioral tests cover these failure paths.
- **Portable browser checks and cleanup:** configure a desktop pointer explicitly instead of relying on a headless runner's input devices. Chrome can relaunch under another process ID, leaving its temporary profile or runner alive. Close the isolated browser through CDP before process-tree fallback; Unix children use isolated process groups so their descendants are also stopped. Validate the generated profile path and allow bounded filesystem retries. Prefer installed stable Chrome, bound debugger discovery and HTTP requests, and retain browser startup diagnostics. A successful audit is announced after cleanup finishes.
- **Browser-test readiness:** a single pointer event after a fixed 100 ms delay could run before lazy cursor assets were ready on Linux. Exercise pointer movement through the transition with a bounded activation check. Register the page-load listener before refresh, bring the headless tab to the front, and verify client interaction before testing router history. A focused local probe confirmed that a visible but unfocused Windows tab did not deliver React focus events until activation. Retain page state and a failure screenshot if navigation fails.
- **Dependency and asset drift:** remove unused `chess.js` and `motion` packages and their unused transitive dependencies. Extend the asset budget from `public/media` to all of `public`, including the cursor pair and favicon.
- **CI maintenance:** replace deprecated Node 20 GitHub actions with verified Node 24 versions pinned to their release commits. Add dependency auditing and retain browser reports/screenshots on successful and failed runs.
- **Documentation:** update installation, validation, shared-scene behavior, cursor fallback, and canonical registry descriptions to match the integrated implementation.

## Validation

- All 80 repository tests pass, including four new regression tests.
- ESLint, TypeScript, content validation, and asset validation pass.
- The production build generates all 41 pages.
- All 27 public assets total less than 91 KiB and remain inside the existing budgets.
- Dependency auditing reports zero known vulnerabilities.
- All 11 configured source/live URLs returned HTTP 200. This is a reachability check, not validation of the external applications' backend capabilities.
- Production browser validation covers eight recruiter routes across ten viewport sizes, 12 resolver outcomes, 15 legacy routes, two expected 404s, gallery decoding, navigation/history, accessibility names/landmarks, reduced motion, shared-canvas continuity, graphics fallback, and cursor failure handling.
- The Windows production browser audit passes with exit code 0: 80 route/viewport checks, zero clipping findings, zero application browser errors, and six review screenshots.
- The complete Linux workflow, including browser history and graphics fallback, passes in the [integration workflow](https://github.com/yorayriniwnl/Portfolio-Ayush-Roy/actions/runs/36302859585). Browser reports and six review screenshots are retained in the `browser-qa` workflow artifact and local `artifacts/browser-qa/` output.

## Measurement limits

Browser performance samples are local/headless observations, not field metrics or representative physical-GPU FPS. WebGL and static fallback are exercised; a physical WebGPU device has not been validated. The Windows environment injects antivirus scripts which the site's CSP blocks; the runner records those separately from application errors.

One profile from an earlier browser run remains in the system temporary directory after automatic approval review blocked manual cleanup. It is outside the repository and is not committed.
