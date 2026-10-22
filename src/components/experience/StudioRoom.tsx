"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { StudioTarget } from "./StudioScene";
import type { StudioObjectAction } from "./YorWorldShowcaseScene";
import { isWalkable, type WalkPoint, type WalkDirection } from "./StudioWalk";
import { recruiterProjects } from "@/content/project-registry";

const Scene = dynamic(
  () => import("./YorWorldShowcaseScene").then((module) => module.YorWorldShowcaseScene),
  { ssr: false, loading: () => null },
);

class StudioErrorBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onError();}
  render(){return this.state.failed?null:this.props.children;}
}

const destinations: Record<StudioTarget, { number: string; title: string; label: string; description: string; href: string; cta: string }> = {
  work: {
    number: "01", title: "The workstation", label: "SELECTED ENGINEERING",
    description: "Open the computer to explore CandidateX, an evidence-first approach to technical assessment.",
    href: "/projects/candidatex", cta: "EXPLORE CANDIDATEX",
  },
  about: {
    number: "02", title: "The human behind it", label: "MEET THE BUILDER",
    description: "Tap the seated developer to trigger a greeting, then discover the person behind the projects.",
    href: "/#about", cta: "ABOUT AYUSH",
  },
  lab: {
    number: "03", title: "Off the clock", label: "EXPERIMENTS + PLAY",
    description: "The wall art leads to my lab: prototypes, experiments and less serious ideas.",
    href: "/lab", cta: "ENTER THE LAB",
  },
  contact: {
    number: "04", title: "An open door", label: "SAY HELLO",
    description: "Have a product idea or something interesting to build? There's always another conversation.",
    href: "/#contact", cta: "GET IN TOUCH",
  },
};

export function StudioRoom() {
  const root = useRef<HTMLDivElement>(null);
  const consoleButton = useRef<HTMLButtonElement>(null);
  const consoleCloseButton = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<StudioTarget>("work");
  const [visible, setVisible] = useState(false);
  const [inViewport, setInViewport] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [graphicsAvailable, setGraphicsAvailable] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [photoMode, setPhotoMode] = useState(false);
  const [blindsOpen, setBlindsOpen] = useState(true);
  const [paintingBeat, setPaintingBeat] = useState(0);
  const [secretFound, setSecretFound] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [hoveredObject, setHoveredObject] = useState<StudioObjectAction | null>(null);
  const [roaming, setRoaming] = useState(false);
  const [touchDirection, setTouchDirection] = useState<WalkDirection | null>(null);
  const [walkTarget, setWalkTarget] = useState<(WalkPoint & { id:number }) | null>(null);
  const walkId = useRef(0);
  const [introSequence, setIntroSequence] = useState(0);
  const [roomReady, setRoomReady] = useState(false);
  const [roomFailed, setRoomFailed] = useState(false);
  const announceReady = useCallback(() => setRoomReady(true), []);
  const reportFailed = useCallback(() => setRoomFailed(true), []);
  const toggleLights = useCallback(() => setLightsOn((value)=>!value), []);
  const selectTarget = useCallback((target: StudioTarget) => {
    setSelected(target); setIntroSequence(0); setConsoleOpen(false);
    setRoaming(false); setWalkTarget(null); setTouchDirection(null);
  }, []);
  const playIntro = useCallback(() => {
    setSelected("work"); setConsoleOpen(false); setRoaming(false); setWalkTarget(null); setTouchDirection(null);
    setIntroSequence((value) => value + 1);
  }, []);
  const toggleRoam = useCallback(() => {
    setPhotoMode(false);setRoaming(current => !current);setWalkTarget(null);setTouchDirection(null);setIntroSequence(0);
  },[]);
  const walkToPoint = useCallback((point:WalkPoint) => {
    setIntroSequence(0);setConsoleOpen(false);setPhotoMode(false);setRoaming(true);
    const id=++walkId.current;
    if(root.current)root.current.dataset.walkTargetId=String(id);
    setWalkTarget({...point,id});
  },[]);
  const reportWalk = useCallback((position:WalkPoint) => {
    if (root.current) {
      root.current.dataset.walkX=position.x.toFixed(3);
      root.current.dataset.walkZ=position.z.toFixed(3);
      root.current.dataset.walkable=String(isWalkable(position.x,position.z));
    }
  },[]);
  const closeConsole = useCallback(() => { setConsoleOpen(false); window.requestAnimationFrame(() => consoleButton.current?.focus()); }, []);
  const activateObject = useCallback((object: StudioObjectAction) => {
    if (object === "lights") setLightsOn(current => !current);
    if (object === "blinds") setBlindsOpen(current => !current);
    if (object === "painting") {
      setPaintingBeat(beat => beat + 1);
      setSecretFound(true);
      setSelected("lab");
      setIntroSequence(0);
      setConsoleOpen(false);
    }
    if (object === "monitor") {
      setSelected("work");
      setIntroSequence(0);
      setConsoleOpen(true);
    }
    if (object === "avatar") { setSelected("about"); if (!roaming) selectTarget("about"); }
    if (object === "door") { setSelected("contact"); if (!roaming) selectTarget("contact"); }
    if (object === "skills") { setSelected("lab"); if (!roaming) selectTarget("lab"); }
  }, [selectTarget, roaming]);
  useEffect(() => {
    if (!consoleOpen) return;
    const frame = window.requestAnimationFrame(() => consoleCloseButton.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeConsole(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("keydown", onKey); };
  }, [consoleOpen, closeConsole]);

  useEffect(() => {
    if(!roaming || consoleOpen) return;
    const onEscape=(event:KeyboardEvent)=>{
      if(event.key!=="Escape" || !document.activeElement?.closest(".yor-studio"))return;
      event.preventDefault();setRoaming(false);setWalkTarget(null);setTouchDirection(null);
    };
    window.addEventListener("keydown",onEscape);
    return ()=>window.removeEventListener("keydown",onEscape);
  },[roaming,consoleOpen]);

  useEffect(() => {
    const handleStudioLink = () => { if (window.location.hash === "#studio") playIntro(); };
    window.addEventListener("hashchange", handleStudioLink);
    if (window.location.hash === "#studio") handleStudioLink();
    return () => window.removeEventListener("hashchange", handleStudioLink);
  }, [playIntro]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    // WebGL can be absent even when motion is allowed (software rendering,
    // privacy settings, headless browsers, or hardware failure).
    const probe = document.createElement("canvas");
    let available = false;
    try {
      const context = probe.getContext("webgl2");
      available = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      available = false;
    }
    const frame = window.requestAnimationFrame(() => setGraphicsAvailable(available));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => { setVisible(true); setInViewport(true); });
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver((entries) => {
      const nearViewport = entries.some((entry) => entry.isIntersecting);
      setInViewport(nearViewport);
      if (nearViewport) setVisible(true);
    }, { rootMargin: "240px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  // Scene-only mode lets the workstation art breathe; Escape restores its controls.
  useEffect(() => {
    if (!photoMode) return;
    const exitPhotoMode = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhotoMode(false);
    };
    window.addEventListener("keydown", exitPhotoMode);
    return () => window.removeEventListener("keydown", exitPhotoMode);
  }, [photoMode]);

  const selectedItem = destinations[selected];
  return (
    <div className="yor-studio" ref={root} data-scene-ready={String(roomReady)} data-scene-failed={String(roomFailed)} data-intro-sequence={introSequence} data-blinds-open={String(blindsOpen)} data-painting-beat={paintingBeat} data-console-open={String(consoleOpen)} data-secret-found={String(secretFound)} data-photo-mode={String(photoMode)} data-roaming={String(roaming)}>
      <div className="yor-studio__topline">
        <span><i className="yor-studio__pulse"/> ROOM ONLINE / STUDIO_001</span>
        <div className="yor-studio__utilities">
          <button type="button" onClick={() => setLightsOn((current) => !current)}
            aria-pressed={lightsOn} aria-label={lightsOn ? "Dim studio lights" : "Turn on studio lights"}>
            {lightsOn ? "✳ LIGHTS ON" : "☾ LIGHTS DIM"}
          </button>
          <button type="button" onClick={playIntro} aria-label="Replay doorway entrance animation">↺ REPLAY ENTRY</button>
        </div>
      </div>
      <div className="yor-studio__viewport" data-walkable-room aria-label="3D studio viewport. Click the floor to travel or enable walking with WASD.">
        <div className="yor-studio__fallback" aria-hidden="true">
          <div className="yor-studio__fallback-light"/>
          <div className="yor-studio__fallback-window"/>
          <div className="yor-studio__fallback-monitor"><b>YOR_</b><span>BUILD SOMETHING</span><span>THAT MATTERS.</span></div>
          <div className="yor-studio__fallback-desk"/>
          <div className="yor-studio__fallback-drawer"/>
          <div className="yor-studio__fallback-lamp"/>
        </div>
        <button type="button" className="yor-studio__photo-toggle"
          aria-pressed={photoMode}
          aria-label={photoMode ? "Exit distraction-free room view" : "View the full studio without interface overlays"}
          onClick={() => { if (!photoMode) { setConsoleOpen(false); setHoveredObject(null); setRoaming(false); setTouchDirection(null); setWalkTarget(null); } setPhotoMode(value => !value); }}>
          {photoMode ? "↙ EXIT SCENE VIEW" : "✧ FULL SCENE"}
        </button>
        {allowed && visible && graphicsAvailable && !roomFailed && <StudioErrorBoundary onError={reportFailed}><Scene onSelect={selectTarget} onInteract={activateObject} onHover={setHoveredObject} onToggleLights={toggleLights} selected={selected} lightsOn={lightsOn} blindsOpen={blindsOpen} paintingBeat={paintingBeat} introSequence={introSequence} roaming={roaming} paused={consoleOpen || !inViewport} walkTarget={walkTarget} touchDirection={touchDirection} onWalkTo={walkToPoint} onWalkStep={reportWalk} onReady={announceReady}/></StudioErrorBoundary>}
        {hoveredObject && !consoleOpen && <div className="yor-studio__hover-label" aria-hidden="true">
          {hoveredObject === "monitor" ? "OPEN PROJECT LAUNCHER" : hoveredObject === "painting" ? "TILT WALL ART" :
            hoveredObject === "blinds" ? "TOGGLE WINDOW BLINDS" : hoveredObject === "lights" ? "TOGGLE STUDIO LIGHTS" :
            hoveredObject === "avatar" ? "GREET THE CREATOR" : hoveredObject === "door" ? "OPEN THE DOOR" : "EXPLORE THE LAB"}
        </div>}
        {consoleOpen && <section className="yor-studio__console" id="yor-room-console" role="dialog" aria-labelledby="yor-room-console-title" aria-describedby="yor-room-console-desc">
          <div className="yor-studio__console-top"><span>YOR.OS / PROJECT LAUNCHER</span><button ref={consoleCloseButton} autoFocus type="button" onClick={closeConsole} aria-label="Close workstation launcher">✕ CLOSE</button></div>
          <h2 id="yor-room-console-title">Select a world<span>.</span></h2>
          <p id="yor-room-console-desc">Real projects, real engineering decisions. Open a case study to explore the evidence.</p>
          <div className="yor-studio__console-projects">
            {recruiterProjects.map((project, index) => <Link href={`/projects/${project.slug}`} key={project.slug} className="yor-studio__console-project">
              <span>{String(index + 1).padStart(2, "0")}</span><span><b>{project.title}</b><small>{project.kicker}</small></span><span aria-hidden="true">↗</span>
            </Link>)}
          </div>
          <div className="yor-studio__console-foot"><span>06 SYSTEMS / DIRECT ACCESS</span><Link href="/projects">ALL PROJECTS ↗</Link></div>
        </section>}
        {roaming && !consoleOpen && <div className="yor-studio__touch-pad" aria-label="Touch controls for walking through the room">
          {(["forward","left","back","right"] as const).map(direction=>
            <button key={direction} type="button" aria-label={`Walk ${direction}`}
              className={`yor-studio__touch-${direction}`} aria-pressed={touchDirection===direction}
              onPointerDown={event=>{setTouchDirection(direction);try{event.currentTarget.setPointerCapture(event.pointerId);}catch{/* Unsupported synthetic pointer capture still permits movement. */}}}
              onPointerUp={()=>setTouchDirection(null)}
              onPointerCancel={()=>setTouchDirection(null)}
              onMouseDown={()=>setTouchDirection(direction)}
              onMouseUp={()=>setTouchDirection(null)}
              onLostPointerCapture={()=>setTouchDirection(null)}>
              {direction==="forward"?"↑":direction==="left"?"←":direction==="back"?"↓":"→"}
            </button>
          )}
        </div>}
        <div className="yor-studio__hud" aria-hidden="true">
          <span>{roaming ? "FREE ROAM / FIRST PERSON" : "REAL 3D / WEBGL"}</span><span>{roaming ? "WASD MOVE · DRAG LOOK · CLICK FLOOR TO WALK" : "CLICK FLOOR TO WALK · INTERACT WITH OBJECTS ↗"}</span>
        </div>
        <div className="yor-studio__corner yor-studio__corner--tl"/><div className="yor-studio__corner yor-studio__corner--br"/>
      </div>
      <div className="yor-studio__actions" aria-label="Interactive room controls">
        <button type="button" className="yor-studio__walk-toggle"
          aria-pressed={roaming} onClick={toggleRoam}
          disabled={!roomReady || !allowed || roomFailed}
          aria-label={roaming?"Exit free roam and return to cinematic camera":"Walk freely around the 3D room using WASD or touch"}>
          <span aria-hidden="true">⌖</span> {roaming?"EXIT WALK MODE":"WALK THE ROOM"}
        </button>
        <button ref={consoleButton} type="button" onClick={() => activateObject("monitor")} aria-expanded={consoleOpen} aria-controls="yor-room-console"><span aria-hidden="true">⌘</span> OPEN WORKSTATION</button>
        <button type="button" onClick={() => activateObject("blinds")} aria-pressed={!blindsOpen}><span aria-hidden="true">◪</span> BLINDS {blindsOpen ? "OPEN" : "CLOSED"}</button>
        <button type="button" onClick={() => activateObject("painting")}><span aria-hidden="true">✳</span> TILT ART</button>
        <button type="button" onClick={() => activateObject("avatar")}><span aria-hidden="true">↗</span> GREET CREATOR</button>
        {secretFound && <span className="yor-studio__secret" role="status">✦ HIDDEN YOR MARK DISCOVERED</span>}
      </div>
      <div className="yor-studio__bottomline">
        <div className="yor-studio__locations" aria-label="Explore the studio">
          {(["work","about","lab","contact"] as const).map((target) =>
            <button key={target} type="button" onClick={() => selectTarget(target)}
              aria-pressed={selected === target} className={selected === target ? "is-active" : ""}>
              <span>{destinations[target].number}</span>{target === "work" ? "DESK" : target === "about" ? "AVATAR" : target === "lab" ? "ART" : "DOOR"}
            </button>
          )}
        </div>
        <div className="yor-studio__description" role="status">
          <div><span>{selectedItem.label}</span><strong>{selectedItem.title}</strong><p>{selectedItem.description}</p></div>
          <Link href={selectedItem.href} aria-label={selectedItem.cta}>{selectedItem.cta} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <p className="yor-studio__access-note">Click anywhere on the floor to walk there. Use Walk the Room and <b>W / A / S / D</b> to move, drag your mouse or finger to look, and <b>Shift</b> to move faster. <b>Escape</b> exits walk mode. On mobile, use the directional pad. Room objects and all project links remain interactive.</p>
    </div>
  );
}
