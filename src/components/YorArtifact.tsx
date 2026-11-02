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
            {/* A kinetic architectural monogram: extruded plates, not orbital rings. */}
            <path d="M124 135L431 80L519 170L474 493L180 558L113 450Z" stroke="#a8d4cb" strokeOpacity=".22" strokeWidth="1.5"/>
            <path d="M146 143L427 95L501 174L461 478L187 539L129 443Z" fill="#091620" fillOpacity=".72" stroke="#a5c9c0" strokeOpacity=".3" strokeWidth="1"/>
            <path d="M122 135L431 80L519 170" stroke="url(#yor-foil)" strokeOpacity=".8" strokeWidth="3"/>
            <path d="M519 170L474 493L180 558" stroke="url(#yor-steel)" strokeOpacity=".65" strokeWidth="3"/>
            <path d="M104 119L165 108M473 77L536 156M92 445L164 545M475 511L535 494" stroke="#93bcb7" strokeOpacity=".35" strokeWidth="2"/>
            <g className="yor-artifact__module yor-artifact__module--a">
              <path d="M165 164L431 115L461 153L202 209Z" fill="url(#yor-steel)" stroke="#e6f4e9" strokeOpacity=".66" strokeWidth="1"/>
              <path d="M202 209L461 153L449 185L208 239Z" fill="#29464f" stroke="#accfc3" strokeOpacity=".55" strokeWidth="1"/>
              <path d="M185 177L402 137M216 223L417 180" stroke="#f0f5e8" strokeOpacity=".45" strokeWidth="1"/>
              <path d="M259 157L362 139" stroke="#ecdec3" strokeWidth="4" strokeLinecap="square"/>
              <circle cx="193" cy="183" r="3" fill="#dbe9d7"/>
              <circle cx="433" cy="140" r="3" fill="#dbe9d7"/>
            </g>
            <g className="yor-artifact__module yor-artifact__module--b">
              <path d="M183 235L449 182L456 430L190 486Z" fill="#12252d" stroke="url(#yor-foil)" strokeOpacity=".55" strokeWidth="2"/>
              <path d="M203 251L430 207L437 408L211 458Z" fill="#142631" fillOpacity=".92" stroke="#a7c8c3" strokeOpacity=".23" strokeWidth="1"/>
              <path d="M217 278L415 239M222 420L422 380" stroke="#cce7dc" strokeOpacity=".17"/>
              <path d="M186 240L128 251V321L158 344M453 225L520 219V292L488 306" stroke="#8dccc4" strokeOpacity=".7" strokeWidth="2"/>
              <rect x="118" y="247" width="15" height="15" fill="#a6dbcf"/>
              <rect x="513" y="212" width="15" height="15" fill="#e9d8bd"/>
              <circle cx="158" cy="344" r="4" fill="#b3e4d7"/>
              <circle cx="488" cy="306" r="4" fill="#e9d8bd"/>
            </g>
            <g className="yor-artifact__module yor-artifact__module--c">
              <path d="M188 475L454 421L469 457L191 516Z" fill="url(#yor-steel)" stroke="#e5f0dd" strokeOpacity=".55" strokeWidth="1"/>
              <path d="M191 516L469 457L459 480L184 537Z" fill="#1a323a" stroke="#acc9c1" strokeOpacity=".4"/>
              <path d="M211 492L435 447" stroke="#f2e2c8" strokeOpacity=".7" strokeWidth="2"/>
              <path d="M230 510L410 474" stroke="#b2d4c8" strokeOpacity=".35"/>
              <path d="M248 530L386 503" stroke="#c5e5d5" strokeOpacity=".28" strokeDasharray="2 6"/>
            </g>
            <g className="yor-artifact__wordmark">
              <path d="M204 286L425 241L432 377L211 422Z" fill="#0a1921" fillOpacity=".77"/>
              <text x="322" y="351" fontSize="124" textAnchor="middle" letterSpacing="-13" fontFamily="Georgia,serif" fontWeight="bold" fill="#07151b" stroke="#07151b" strokeWidth="4" transform="translate(5 8)">YOR</text>
              <text x="322" y="351" fontSize="124" textAnchor="middle" letterSpacing="-13" fontFamily="Georgia,serif" fontWeight="bold" fill="url(#yor-foil)" stroke="#dae9dc" strokeOpacity=".56" strokeWidth=".8">YOR</text>
              <path d="M230 374H405" stroke="#b9d7c9" strokeOpacity=".7" strokeWidth="1"/>
              <text x="320" y="392" fontSize="11" textAnchor="middle" letterSpacing="3" fontFamily="monospace" fill="#c3dcd2">DESIGN · BUILD · VERIFY</text>
            </g>
            <path d="M99 92H181M460 88H548M86 554H173M461 550H548" stroke="#b9ddce" strokeOpacity=".28" strokeWidth=".8"/>
            <path d="M99 92V133M548 88V132M86 554V515M548 550V511" stroke="#b9ddce" strokeOpacity=".28" strokeWidth=".8"/>
            <path d="M94 320H132M514 320H548" stroke="#c8e4d6" strokeOpacity=".55" strokeWidth="1"/>
            <circle cx="94" cy="320" r="3" fill="#dce5d7"/>
            <circle cx="548" cy="320" r="3" fill="#dce5d7"/>
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
      <p className="sr-only">An original faceted YOR architectural monogram with three independent kinetic panels, structural rails, and an embossed wordmark. Select Create, Connect or Refine to explore the philosophy; pause the motion if preferred.</p>
    </div>
  );
}
