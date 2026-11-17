"use client";

import type { Project, ProjectDemoMode } from "@/content/projects";
import { useExperience } from "@/experience/ExperienceProvider";

const choices: Record<Exclude<ProjectDemoMode, "avelry">, readonly [string, string]> = {
  helios: ["Nominal signal", "Illustrative anomaly"],
  zenith: ["Baseline roof scenario", "Higher solar scenario"],
  "ai-vs-real": ["LBP feature view", "GLCM feature view"],
};

const choiceDescriptions: Record<Exclude<ProjectDemoMode, "avelry">, readonly [string, string]> = {
  helios: [
    "Nominal deterministic signal selected. Sample telemetry is illustrative, not field data.",
    "Illustrative anomaly selected at the operator boundary. No live device or provider is involved.",
  ],
  zenith: [
    "Baseline illustrative roof scenario selected. Values remain assumption-bound.",
    "Higher illustrative solar scenario selected. This is not a surveyed design or investment advice.",
  ],
  "ai-vs-real": [
    "LBP feature view selected. The portfolio walkthrough is explanatory, not live inference.",
    "GLCM feature view selected. The result remains bounded to the repository's documented holdout.",
  ],
};

// Avelry's source is private, so the explorer names file paths without linking to them.
const avelryNodes = [
  { name: "Web app", responsibility: "Owns the React/TypeScript social shell and requests state through authenticated API and Socket.IO calls.", failure: "Stale optimistic state, or a reconnect treated as trusted without revalidation.", verification: "Web-release review: 345 Chromium end-to-end tests", sourceLocation: "social/src/App.tsx", testCoverage: "Chromium end-to-end suite", designDecision: "Keep the client responsive while the server stays the policy owner." },
  { name: "Protection gate", responsibility: "Applies the current emergency level (normal, guarded, read-only, offline) to every route before the handler runs.", failure: "A write or paid call slipping through while the platform is meant to be read-only or paused.", verification: "Operator runbook for emergency controls", sourceLocation: "api-server/src/middlewares/protection-gate.ts", testCoverage: "api-server/src/__tests__/spend-guard.test.ts", designDecision: "Decide what stays open per level, so sign-in and recovery outlive paid and risky features." },
  { name: "API + Socket.IO", responsibility: "Authenticates requests, authorizes realtime events, and coordinates durable product behavior.", failure: "An unauthorized event or dropped connection being accepted as a completed action.", verification: "Web-release review: 855 API tests", sourceLocation: "api-server/src/socket/index.ts", testCoverage: "api-server/src/__tests__/socket-security.test.ts", designDecision: "Gate realtime events at the same trust boundary as HTTP requests." },
  { name: "Redis", responsibility: "Carries rate limits, queues, and the idempotent provider spend ledger without owning product truth.", failure: "A retry double-counting spend, or a lost ledger allowing unbounded provider calls.", verification: "Rate-limit and spend-ledger test suites", sourceLocation: "api-server/src/lib/spend-ledger.ts", testCoverage: "api-server/src/__tests__/spend-ledger-redis.test.ts", designDecision: "Make spend accounting idempotent and fail closed when the ledger is missing." },
  { name: "PostgreSQL", responsibility: "Stores durable social state behind Drizzle schemas and transaction boundaries.", failure: "A partial write or migration mismatch leaving the source of truth inconsistent.", verification: "Web-release review: 855 API tests", sourceLocation: "lib/db/src/schema", testCoverage: "api-server/src/__tests__/suspended-rights.integration.test.ts", designDecision: "Make relational state the source of truth and keep Redis transient." },
] as const;

function isInteractiveMode(mode: ProjectDemoMode): mode is Exclude<ProjectDemoMode, "avelry"> {
  return mode !== "avelry";
}

export function ProjectInteractionPanel({ project }: { project: Project }) {
  const mode = project.demoMode;
  const { state, setDemoChoice, runDemo, selectDemoNode } = useExperience();
  if (!mode) return null;

  const { choice, run, selectedNode } = state.demo;
  const status = isInteractiveMode(mode)
    ? choiceDescriptions[mode][choice]
    : run > 0
      ? `Sample message path run ${run}. No external service is contacted.`
      : "Ready. The walkthrough is deterministic and does not contact an external service.";

  return (
    <section className="demo" aria-labelledby={`demo-${project.slug}`} data-experience-section="projects" data-case-section="interaction" data-demo-project={project.slug} data-demo-choice={choice} data-demo-run={run}>
      <div className="demo-copy">
        <span className="technical">Deterministic explanation / no external calls</span>
        <h2 id={`demo-${project.slug}`}>Interactive system view.</h2>
        <p className="project-interaction-status" aria-live="polite">{status}</p>
        {isInteractiveMode(mode) ? (
          <div className="actions project-interaction-choices" role="group" aria-label={`${project.title} sample state`}>
            {choices[mode].map((label, index) => (
              <button
                className={`action${choice === index ? " primary" : ""}`}
                type="button"
                key={label}
                aria-pressed={choice === index}
                onClick={() => setDemoChoice(index as 0 | 1)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="actions project-interaction-choices" role="group" aria-label="Avelry sample walkthrough">
              <button className="action primary" type="button" onClick={runDemo}>Send sample message</button>
            </div>
            <div className="architecture-explorer" aria-label="Avelry architecture explorer">
              <span className="technical">Path explorer / select a boundary</span>
              <div className="architecture-nodes" role="list">
                {avelryNodes.map((node, index) => (
                  <div role="listitem" key={node.name}>
                    <button
                      type="button"
                      className={`architecture-node-button${selectedNode === index ? " is-selected" : ""}`}
                      aria-pressed={selectedNode === index}
                      onClick={() => selectDemoNode(index)}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>{node.name}
                    </button>
                  </div>
                ))}
              </div>
              <div className="architecture-detail" aria-live="polite">
                <strong>{avelryNodes[selectedNode % avelryNodes.length].name}</strong>
                <p>{avelryNodes[selectedNode % avelryNodes.length].responsibility}</p>
                <p><b>Failure to watch.</b> {avelryNodes[selectedNode % avelryNodes.length].failure}</p>
                <p><b>Decision.</b> {avelryNodes[selectedNode % avelryNodes.length].designDecision}</p>
                <span className="technical">Verification / {avelryNodes[selectedNode % avelryNodes.length].verification}</span>
                <span className="technical">Test surface / {avelryNodes[selectedNode % avelryNodes.length].testCoverage}</span>
                <span className="technical">Run count / {run}</span>
                <span className="technical">Source (private) / {avelryNodes[selectedNode % avelryNodes.length].sourceLocation}</span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="demo-stage demo-stage--shared" style={{ backgroundImage: `url("${project.art}")` }} role="img" aria-label={`Static project artwork for ${project.title}`} />
      <p className="technical project-interaction-footnote" role="status">The shared machine world follows this project. This panel remains complete without graphics.</p>
    </section>
  );
}
