"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

const modes = [
  { label: "Create", headline: "Make the invisible tangible.", description: "Interfaces and product ideas shaped into something you can explore." },
  { label: "Connect", headline: "Think in systems.", description: "The quiet architecture connecting people, data, services and experiences." },
  { label: "Refine", headline: "Question every detail.", description: "Engineering judged by evidence, clarity, resilience and craft." },
] as const;

export function YorArtifact() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const motionPreference = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      motionPreference.current = media.matches;
      setReducedMotion(media.matches);
      setPaused(media.matches);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { rootMargin: "160px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (paused || motionPreference.current || event.pointerType === "touch") return;
    const element = frame.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    element.style.setProperty("--artifact-ry", `${Math.max(-1, Math.min(1, x * 2)) * 9}deg`);
    element.style.setProperty("--artifact-rx", `${Math.max(-1, Math.min(1, y * 2)) * -7}deg`);
  }
  function reset() {
    frame.current?.style.setProperty("--artifact-rx", "0deg");
    frame.current?.style.setProperty("--artifact-ry", "0deg");
  }

  return (
    <div ref={root} className="yor-artifact" role="group" data-paused={paused} data-visible={inView} data-reduced-motion={reducedMotion} aria-label="Interactive YOR engineering sculpture">
      <div className="yor-artifact__top"><span><span className="yor-artifact__asterisk">✳</span> YOR / THE FORM STUDY</span><span>VOL. 001</span></div>
      <div className="yor-artifact__stage" ref={frame} data-mode={active} onPointerMove={move} onPointerLeave={reset}>
        <div className="yor-artifact__grid" aria-hidden="true" />
        <div className="yor-artifact__halo" aria-hidden="true" />
        <span className="yor-artifact__axis yor-artifact__axis--top" aria-hidden="true">CURIOUS BY DESIGN</span>
        <span className="yor-artifact__axis yor-artifact__axis--bottom" aria-hidden="true">ENGINEERED TO LAST</span>
        <svg className="yor-artifact__sculpture" viewBox="0 0 640 640" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="yor-steel" x1="73" y1="109" x2="560" y2="527" gradientUnits="userSpaceOnUse">
              <stop stopColor="#314651"/><stop offset=".15" stopColor="#e1f7ec"/><stop offset=".32" stopColor="#729498"/><stop offset=".48" stopColor="#293942"/><stop offset=".63" stopColor="#dbf0e6"/><stop offset=".82" stopColor="#6d8a90"/><stop offset="1" stopColor="#17232c"/>
            </linearGradient>
            <linearGradient id="yor-foil" x1="175" y1="170" x2="440" y2="495" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f7efd9"/><stop offset=".35" stopColor="#aec9c5"/><stop offset=".6" stopColor="#72848d"/><stop offset=".85" stopColor="#f0e3cf"/><stop offset="1" stopColor="#576a71"/>
            </linearGradient>
            <radialGradient id="yor-core"><stop stopColor="#d8ece3"/><stop offset=".18" stopColor="#a2bebc"/><stop offset=".48" stopColor="#2f4a51"/><stop offset=".8" stopColor="#0b1721"/><stop offset="1" stopColor="#0a111a"/></radialGradient>
            <radialGradient id="yor-haze"><stop stopColor="#8ed3cf" stopOpacity=".25"/><stop offset="1" stopColor="#8ed3cf" stopOpacity="0"/></radialGradient>
            <filter id="yor-ambient"><feGaussianBlur stdDeviation="14"/></filter>
          </defs>
          <circle cx="320" cy="320" r="286" fill="url(#yor-haze)"/>
          <g className="yor-artifact__geometry">
            <circle cx="320" cy="320" r="212" stroke="#9abeba" strokeOpacity=".12" strokeWidth="1"/>
            <circle cx="320" cy="320" r="266" stroke="#97c3bb" strokeOpacity=".10" strokeDasharray="2 12"/>
            <path d="M320 24V616M24 320H616" stroke="#8facaa" strokeOpacity=".12" strokeWidth=".6"/>
            <g className="yor-artifact__orbit yor-artifact__orbit--a" transform="rotate(-35 320 320)">
              <ellipse cx="320" cy="320" rx="238" ry="118" stroke="#050d12" strokeWidth="27"/>
              <ellipse cx="320" cy="320" rx="238" ry="118" stroke="url(#yor-steel)" strokeWidth="17"/>
              <ellipse cx="320" cy="320" rx="238" ry="118" stroke="#edf5e8" strokeOpacity=".72" strokeWidth="1"/>
              <ellipse cx="320" cy="320" rx="238" ry="118" stroke="#09131c" strokeOpacity=".58" strokeWidth="3" transform="translate(0 8)"/>
            </g>
            <g className="yor-artifact__orbit yor-artifact__orbit--b" transform="rotate(54 320 320)">
              <ellipse cx="320" cy="320" rx="216" ry="141" stroke="#080f16" strokeWidth="22"/>
              <ellipse cx="320" cy="320" rx="216" ry="141" stroke="url(#yor-steel)" strokeWidth="12"/>
              <ellipse cx="320" cy="320" rx="216" ry="141" stroke="#fcf2dc" strokeOpacity=".62" strokeWidth="1.1"/>
            </g>
            <g className="yor-artifact__orbit yor-artifact__orbit--c" transform="rotate(18 320 320)">
              <ellipse cx="320" cy="320" rx="153" ry="238" stroke="#09121b" strokeWidth="14"/>
              <ellipse cx="320" cy="320" rx="153" ry="238" stroke="url(#yor-foil)" strokeWidth="8"/>
              <ellipse cx="320" cy="320" rx="153" ry="238" stroke="#b7e4d5" strokeOpacity=".7" strokeWidth=".8"/>
            </g>
            <circle cx="320" cy="320" r="121" fill="#72b4af" fillOpacity=".2" filter="url(#yor-ambient)"/>
            <circle cx="320" cy="320" r="115" fill="url(#yor-core)" stroke="url(#yor-foil)" strokeWidth="4"/>
            <circle cx="320" cy="320" r="98" stroke="#c5dcd1" strokeOpacity=".35"/>
            <circle cx="320" cy="320" r="83" stroke="#a6d2cd" strokeOpacity=".2" strokeDasharray="2 7"/>
            <path d="M320 232V408M232 320H408" stroke="#d5e7dc" strokeOpacity=".18"/>
            <text x="320" y="349" textAnchor="middle" fontSize="80" letterSpacing="-13" fontFamily="Georgia,serif" fontWeight="bold" fill="url(#yor-foil)">YOR</text>
            <circle cx="320" cy="320" r="278" stroke="#d8e5d8" strokeOpacity=".28" strokeDasharray="1 24"/>
            <circle cx="95" cy="187" r="4" fill="#d7e9d6"/><circle cx="550" cy="436" r="4" fill="#d7e9d6"/>
            <path d="M90 187H30M550 436H608" stroke="#c8e5d4" strokeOpacity=".5"/>
          </g>
        </svg>
        <span className="yor-artifact__point yor-artifact__point--one" aria-hidden="true"><i /> FORM / 01</span>
        <span className="yor-artifact__point yor-artifact__point--two" aria-hidden="true"><i /> SYSTEM / 02</span>
        <span className="yor-artifact__point yor-artifact__point--three" aria-hidden="true"><i /> CRAFT / 03</span>
      </div>
      <div className="yor-artifact__console">
        <div className="yor-artifact__controls" role="group" aria-label="Explore three sides of the YOR design philosophy">
          {modes.map((mode, index) => <button type="button" key={mode.label} aria-pressed={active === index} onClick={() => setActive(index)}><span>0{index + 1}</span> {mode.label}</button>)}
          <button type="button" className="yor-artifact__pause" disabled={reducedMotion} aria-label={reducedMotion ? "Sculpture motion disabled by reduced-motion preference" : paused ? "Play sculpture motion" : "Pause sculpture motion"} onClick={() => { reset(); setPaused(p => !p); }}>{paused ? "▶" : "Ⅱ"}</button>
        </div>
        <div className="yor-artifact__description" aria-live="polite" aria-atomic="true"><strong>{modes[active].headline}</strong><p>{modes[active].description}</p></div>
      </div>
      <p className="sr-only">An original silver and mineral-glass sculpture: three interlocking engineering orbits circle the YOR monogram. Select Create, Connect or Refine to explore the philosophy; pause the motion if preferred.</p>
    </div>
  );
}
