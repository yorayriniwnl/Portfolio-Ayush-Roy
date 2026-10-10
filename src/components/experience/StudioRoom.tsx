"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { StudioTarget } from "./StudioScene";

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
  const [selected, setSelected] = useState<StudioTarget>("work");
  const [visible, setVisible] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [graphicsAvailable, setGraphicsAvailable] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);
  const [roomReady, setRoomReady] = useState(false);
  const [roomFailed, setRoomFailed] = useState(false);
  const announceReady = useCallback(() => setRoomReady(true), []);
  const reportFailed = useCallback(() => setRoomFailed(true), []);
  const toggleLights = useCallback(() => setLightsOn((value)=>!value), []);

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
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  const selectedItem = destinations[selected];
  return (
    <div className="yor-studio" ref={root} data-scene-ready={String(roomReady)} data-scene-failed={String(roomFailed)}>
      <div className="yor-studio__topline">
        <span><i className="yor-studio__pulse"/> ROOM ONLINE / STUDIO_001</span>
        <div className="yor-studio__utilities">
          <button type="button" onClick={() => setLightsOn((current) => !current)}
            aria-pressed={lightsOn} aria-label={lightsOn ? "Dim studio lights" : "Turn on studio lights"}>
            {lightsOn ? "✳ LIGHTS ON" : "☾ LIGHTS DIM"}
          </button>
          <button type="button" onClick={() => setSelected("work")}>↺ RESET CAMERA</button>
        </div>
      </div>
      <div className="yor-studio__viewport">
        <div className="yor-studio__fallback" aria-hidden="true">
          <div className="yor-studio__fallback-light"/>
          <div className="yor-studio__fallback-window"/>
          <div className="yor-studio__fallback-monitor"><b>YOR_</b><span>BUILD SOMETHING</span><span>THAT MATTERS.</span></div>
          <div className="yor-studio__fallback-desk"/>
          <div className="yor-studio__fallback-drawer"/>
          <div className="yor-studio__fallback-lamp"/>
        </div>
        {allowed && visible && graphicsAvailable && !roomFailed && <StudioErrorBoundary onError={reportFailed}><Scene onSelect={setSelected} onToggleLights={toggleLights} selected={selected} lightsOn={lightsOn} onReady={announceReady}/></StudioErrorBoundary>}
        <div className="yor-studio__hud" aria-hidden="true">
          <span>REAL 3D / WEBGL</span><span>CLICK OBJECTS · CHANGE CAMERA ANGLES ↗</span>
        </div>
        <div className="yor-studio__corner yor-studio__corner--tl"/><div className="yor-studio__corner yor-studio__corner--br"/>
      </div>
      <div className="yor-studio__bottomline">
        <div className="yor-studio__locations" aria-label="Explore the studio">
          {(["work","about","lab","contact"] as const).map((target) =>
            <button key={target} type="button" onClick={() => setSelected(target)}
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
      <p className="yor-studio__access-note">Click the computer, avatar, artwork or door. Use the four camera presets if you prefer a keyboard or touch interface. The full portfolio remains accessible without 3D.</p>
    </div>
  );
}
