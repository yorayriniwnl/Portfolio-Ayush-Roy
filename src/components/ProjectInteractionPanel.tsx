"use client";

import type { Project, ProjectDemoMode } from "@/content/projects";
import { useExperience } from "@/experience/ExperienceProvider";

const choices: Record<Exclude<ProjectDemoMode, "talks">, readonly [string, string]> = {
  helios: ["Nominal signal", "Illustrative anomaly"],
  zenith: ["Baseline roof scenario", "Higher solar scenario"],
  "ai-vs-real": ["LBP feature view", "GLCM feature view"],
};

const choiceDescriptions: Record<Exclude<ProjectDemoMode, "talks">, readonly [string, string]> = {
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

const talksNodes = [
  { name: "Browser", responsibility: "Owns the social shell and requests state through authenticated boundaries.", failure: "Stale optimistic state or a reconnect that is treated as trusted without revalidation.", verification: "Local regression/build path", sourceLocation: "social/src/App.tsx", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/social/src/App.tsx", testCoverage: "Repository path: e2e/core-social.spec.ts", designDecision: "Keep presentation responsive while the server remains the policy owner.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "Web app", responsibility: "Translates user intent into REST and Socket.IO calls without becoming a second policy layer.", failure: "A client-only permission check drifting away from server authorization.", verification: "Repository architecture / readiness audit", sourceLocation: "social/src/components/layout/AppShell.tsx", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/social/src/components/layout/AppShell.tsx", testCoverage: "Repository path: e2e/core-social.spec.ts", designDecision: "Treat the client as an adapter, not a duplicate authorization system.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "API + WebSocket", responsibility: "Authenticates requests, authorizes events, and coordinates durable product behavior.", failure: "An unauthorized event or dropped connection being accepted as a completed action.", verification: "Repository architecture / readiness audit", sourceLocation: "api-server/src/socket/index.ts", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/api-server/src/socket/index.ts", testCoverage: "Repository path: api-server/src/__tests__/socket-security.test.ts", designDecision: "Gate realtime events at the same trust boundary as HTTP requests.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "Redis", responsibility: "Carries queues, notifications, and ephemeral worker paths that should not own product truth.", failure: "A retry, queue, or notification path failing without a durable state transition.", verification: "Repository architecture / readiness audit", sourceLocation: "api-server/src/services/queue-service.ts", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/api-server/src/services/queue-service.ts", testCoverage: "Repository path: api-server/src/__tests__/redis-budget.test.ts", designDecision: "Use Redis for transient coordination while durable state stays in PostgreSQL.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "PostgreSQL", responsibility: "Stores durable social state behind Drizzle migrations and transaction boundaries.", failure: "A partial write or migration mismatch leaving the source of truth inconsistent.", verification: "Repository architecture / readiness audit", sourceLocation: "api-server/src/repositories/base-repository.ts", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/api-server/src/repositories/base-repository.ts", testCoverage: "Repository path: api-server/src/__tests__/settings-concurrency.test.ts", designDecision: "Make relational state the source of truth and keep repository boundaries explicit.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
] as const;

function isInteractiveMode(mode: ProjectDemoMode): mode is Exclude<ProjectDemoMode, "talks"> {
  return mode !== "talks";
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
            <div className="actions project-interaction-choices" role="group" aria-label="Yor Talks sample walkthrough">
              <button className="action primary" type="button" onClick={runDemo}>Send sample message</button>
            </div>
            <div className="architecture-explorer" aria-label="Yor Talks architecture explorer">
              <span className="technical">Path explorer / select a boundary</span>
              <div className="architecture-nodes" role="list">
                {talksNodes.map((node, index) => (
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
                <strong>{talksNodes[selectedNode % talksNodes.length].name}</strong>
                <p>{talksNodes[selectedNode % talksNodes.length].responsibility}</p>
                <p><b>Failure to watch.</b> {talksNodes[selectedNode % talksNodes.length].failure}</p>
                <p><b>Decision.</b> {talksNodes[selectedNode % talksNodes.length].designDecision}</p>
                <span className="technical">Verification / {talksNodes[selectedNode % talksNodes.length].verification}</span>
                <span className="technical">Test surface / {talksNodes[selectedNode % talksNodes.length].testCoverage}</span>
                <span className="technical">Run count / {run}</span>
                <a href={talksNodes[selectedNode % talksNodes.length].sourceUrl} target="_blank" rel="noopener noreferrer">Source / {talksNodes[selectedNode % talksNodes.length].sourceLocation} ↗</a>
                <a href={talksNodes[selectedNode % talksNodes.length].evidenceUrl} target="_blank" rel="noopener noreferrer">Repository evidence ↗</a>
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
