"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three/webgpu";
import { color } from "three/tsl";
import { getScenePixelRatio, syncSceneRendererSize } from "./sceneQuality";
import type { ProjectDemoMode } from "@/content/projects";

type Mode = ProjectDemoMode;
type TalksNode = {
  name: string;
  responsibility: string;
  failure: string;
  verification: string;
  sourceLocation: string;
  sourceUrl: string;
  testCoverage: string;
  designDecision: string;
  evidenceUrl: string;
};

const talksNodes: readonly TalksNode[] = [
  { name: "Browser", responsibility: "Owns the social shell and requests state through authenticated boundaries.", failure: "Stale optimistic state or a reconnect that is treated as trusted without revalidation.", verification: "Local regression/build path", sourceLocation: "social/src/App.tsx", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/social/src/App.tsx", testCoverage: "Repository path: e2e/core-social.spec.ts", designDecision: "Keep presentation responsive while the server remains the policy owner.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "Web app", responsibility: "Translates user intent into REST and Socket.IO calls without becoming a second policy layer.", failure: "A client-only permission check drifting away from server authorization.", verification: "Repository architecture / readiness audit", sourceLocation: "social/src/components/layout/AppShell.tsx", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/social/src/components/layout/AppShell.tsx", testCoverage: "Repository path: e2e/core-social.spec.ts", designDecision: "Treat the client as an adapter, not a duplicate authorization system.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "API + WebSocket", responsibility: "Authenticates requests, authorizes events, and coordinates durable product behavior.", failure: "An unauthorized event or dropped connection being accepted as a completed action.", verification: "Repository architecture / readiness audit", sourceLocation: "api-server/src/socket/index.ts", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/api-server/src/socket/index.ts", testCoverage: "Repository path: api-server/src/__tests__/socket-security.test.ts", designDecision: "Gate realtime events at the same trust boundary as HTTP requests.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "Redis", responsibility: "Carries queues, notifications, and ephemeral worker paths that should not own product truth.", failure: "A retry, queue, or notification path failing without a durable state transition.", verification: "Repository architecture / readiness audit", sourceLocation: "api-server/src/services/queue-service.ts", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/api-server/src/services/queue-service.ts", testCoverage: "Repository path: api-server/src/__tests__/redis-budget.test.ts", designDecision: "Use Redis for transient coordination while durable state stays in PostgreSQL.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
  { name: "PostgreSQL", responsibility: "Stores durable social state behind Drizzle migrations and transaction boundaries.", failure: "A partial write or migration mismatch leaving the source of truth inconsistent.", verification: "Repository architecture / readiness audit", sourceLocation: "api-server/src/repositories/base-repository.ts", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/main/api-server/src/repositories/base-repository.ts", testCoverage: "Repository path: api-server/src/__tests__/settings-concurrency.test.ts", designDecision: "Make relational state the source of truth and keep repository boundaries explicit.", evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2" },
];

class SceneBoundary extends React.Component<{ children: React.ReactNode; onFail?: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Mat({ hot = false }: { hot?: boolean }) {
  const material = useMemo(() => {
    const next = new THREE.MeshStandardNodeMaterial();
    next.colorNode = color(hot ? "#ff1f2d" : "#140106");
    next.roughness = hot ? 0.25 : 0.58;
    next.metalness = hot ? 0.35 : 0.6;
    return next;
  }, [hot]);

  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="material" />;
}

function Box({ p, s = [0.72, 0.72, 0.18], hot = false }: { p: [number, number, number]; s?: [number, number, number]; hot?: boolean }) {
  return <mesh position={p}><boxGeometry args={s} /><Mat hot={hot} /></mesh>;
}

function DemoScene({ mode, run, choice, selectedNode, reduced }: { mode: Mode; run: number; choice: number; selectedNode: number; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const progress = useRef(1);
  const marker = useRef<THREE.Mesh>(null);

  useEffect(() => {
    progress.current = 0;
  }, [run]);

  useFrame((_, delta) => {
    if (!root.current || reduced) return;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, 0.06 * Math.sin(run * 0.7), 4, delta);
    progress.current = Math.min(1, progress.current + delta * 0.75);
    if (marker.current) marker.current.position.x = -1.9 + 3.8 * THREE.MathUtils.smoothstep(progress.current, 0, 1);
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.25} />
      <pointLight position={[2, 2, 4]} intensity={28} color="#ff1f2d" distance={8} />
      {mode === "talks" && <>
        <Box p={[-1.9, 0, 0]} hot={selectedNode === 0} /><Box p={[-0.65, 0.55, -0.15]} hot={selectedNode === 1} /><Box p={[0.65, -0.25, -0.2]} hot={selectedNode === 2} /><Box p={[1.9, 0.3, 0]} hot={selectedNode >= 3} />
        <mesh ref={marker} position={[-1.9, 0.12, 0.6]}><sphereGeometry args={[0.11, 18, 18]} /><Mat hot /></mesh>
      </>}
      {mode === "helios" && <>{[-2, -1.2, -0.4, 0.4, 1.2, 2].map((x, index) => <Box key={x} p={[x, -0.75 + (choice && index === 4 ? 0.85 : (index % 3) * 0.22), 0]} s={[0.22, choice && index === 4 ? 2.7 : 0.7 + (index % 3) * 0.45, 0.22]} hot={choice === 1 && index === 4} />)}</>}
      {mode === "ai-vs-real" && <>
        <Box p={[-1.35, 0, 0]} s={[1.7, 1.7, 0.08]} hot={choice === 0} /><Box p={[1.35, 0, 0]} s={[1.7, 1.7, 0.08]} hot={choice === 1} />
        {Array.from({ length: 12 }).map((_, index) => <mesh key={index} position={[-1.8 + (index % 6) * 0.18, 0.7 - Math.floor(index / 6) * 0.3, 0.15]}><sphereGeometry args={[0.04 + (index % 3) * 0.01, 8, 8]} /><Mat hot={index % 2 === choice} /></mesh>)}
      </>}
      {mode === "zenith" && <>
        <mesh rotation={[-0.65, 0, 0]} position={[0, -0.4, 0]}><boxGeometry args={[4.4, 2.2, 0.14]} /><Mat /></mesh>
        {Array.from({ length: 12 }).map((_, index) => { const column = index % 4; const row = Math.floor(index / 4); return <mesh key={index} rotation={[-0.55 - choice * 0.08, 0, 0]} position={[-1.45 + column * 0.95, 0.22 + row * 0.5, -0.15 + row * 0.05]}><boxGeometry args={[0.72, 0.36, 0.05]} /><Mat hot={choice === 1 && index % 3 === 0} /></mesh>; })}
      </>}
    </group>
  );
}

const labels: Record<Mode, string[]> = {
  talks: ["Ready", "Sample message traversed client → API → persistence → recipient"],
  helios: ["Nominal deterministic signal", "Illustrative anomaly revealed at operator boundary"],
  "ai-vs-real": ["LBP feature view selected", "GLCM feature view selected"],
  zenith: ["Baseline illustrative roof scenario", "Higher illustrative solar scenario"],
};

export function ProjectDemo({ mode, art }: { mode: Mode; art: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [choice, setChoice] = useState(0);
  const [selectedNode, setSelectedNode] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));
  const [pageVisible, setPageVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (!entry.isIntersecting) setReady(false);
    }, { rootMargin: "240px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const forceWebGL = typeof window !== "undefined" && new URLSearchParams(location.search).get("renderer") === "webgl";
  const options = [0, 1];
  const renderScene = !reduced && !failed && active;
  const action = mode === "talks" ? () => setRun((value) => value + 1) : () => setChoice((value) => (value + 1) % options.length);
  const status = reduced ? "Static equivalent · reduced motion" : failed ? "Static fallback · renderer unavailable" : !active ? "Artwork first · offscreen" : !pageVisible ? "Scene paused · tab hidden" : ready ? (forceWebGL ? "WebGL 2 test path" : "GPU scene ready") : "Artwork first · initializing";

  return (
    <section className="demo" aria-labelledby={`demo-${mode}`}>
      <div className="demo-copy">
        <span className="technical">Deterministic explanation / no external calls</span>
        <h2 id={`demo-${mode}`}>Interactive system view.</h2>
        <p>{labels[mode][Math.min(choice, labels[mode].length - 1)]}</p>
        <div className="actions">
        <button className="action primary" onClick={action}>{mode === "talks" ? "Send sample message" : "Change sample state"}</button>
          {mode === "talks" && <button className="action" onClick={() => setSelectedNode((value) => (value + 1) % talksNodes.length)}>Explain path</button>}
        </div>
        <p className="technical" aria-live="polite">{mode === "talks" ? (run ? labels[mode][1] : labels[mode][0]) : labels[mode][Math.min(choice, labels[mode].length - 1)]}</p>
        {mode === "talks" && <div className="architecture-explorer" aria-label="Yor Talks architecture explorer">
          <span className="technical">Path explorer / select a boundary</span>
          <div className="architecture-nodes" role="list">
            {talksNodes.map((node, index) => <button type="button" className={`architecture-node-button${selectedNode === index ? " is-selected" : ""}`} aria-pressed={selectedNode === index} onClick={() => setSelectedNode(index)} key={node.name}><span>{String(index + 1).padStart(2, "0")}</span>{node.name}</button>)}
          </div>
          <div className="architecture-detail" aria-live="polite">
            <strong>{talksNodes[selectedNode].name}</strong>
            <p>{talksNodes[selectedNode].responsibility}</p>
            <p><b>Failure to watch.</b> {talksNodes[selectedNode].failure}</p>
            <p><b>Decision.</b> {talksNodes[selectedNode].designDecision}</p>
            <span className="technical">Verification / {talksNodes[selectedNode].verification}</span>
            <span className="technical">Test surface / {talksNodes[selectedNode].testCoverage}</span>
            <a href={talksNodes[selectedNode].sourceUrl} target="_blank" rel="noopener noreferrer">Source / {talksNodes[selectedNode].sourceLocation} ↗</a>
            <a href={talksNodes[selectedNode].evidenceUrl} target="_blank" rel="noopener noreferrer">Repository evidence ↗</a>
          </div>
        </div>}
      </div>
      <div ref={stageRef} className="demo-stage" style={{ backgroundImage: `url("${art}")` }}>
        {renderScene && <SceneBoundary onFail={() => { setFailed(true); setReady(false); }}><Canvas aria-hidden="true" camera={{ position: [0, 0, 5.4], fov: 42 }} dpr={[1, 1.35]} frameloop={pageVisible ? "always" : "never"} gl={async (props) => {
          try {
            const renderer = new THREE.WebGPURenderer({ canvas: props.canvas as HTMLCanvasElement, antialias: true, alpha: true, forceWebGL });
            renderer.setPixelRatio(getScenePixelRatio(1.35));
            await renderer.init();
            syncSceneRendererSize(renderer, props.canvas as HTMLCanvasElement);
            setReady(true);
            return renderer;
          } catch (error) {
            setFailed(true);
            setReady(false);
            throw error;
          }
        }}><DemoScene mode={mode} run={run} choice={choice} selectedNode={selectedNode} reduced={reduced} /></Canvas></SceneBoundary>}
        <span className="scene-status" role="status">{status}</span>
      </div>
    </section>
  );
}
