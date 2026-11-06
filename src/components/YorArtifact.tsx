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
              <stop stopColor="#3e4149"/><stop offset=".15" stopColor="#e3eeff"/><stop offset=".32" stopColor="#858b9b"/><stop offset=".48" stopColor="#33353c"/><stop offset=".63" stopColor="#dde7ff"/><stop offset=".82" stopColor="#7c8291"/><stop offset="1" stopColor="#1f2124"/>
            </linearGradient>
            <linearGradient id="yor-foil" x1="175" y1="170" x2="440" y2="495" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e1ecff"/><stop offset=".35" stopColor="#b7c0d6"/><stop offset=".6" stopColor="#797f8e"/><stop offset=".85" stopColor="#d7e1fb"/><stop offset="1" stopColor="#606571"/>
            </linearGradient>
            <radialGradient id="yor-core"><stop stopColor="#d9e4fe"/><stop offset=".18" stopColor="#adb5ca"/><stop offset=".48" stopColor="#41444c"/><stop offset=".8" stopColor="#141517"/><stop offset="1" stopColor="#0f1012"/></radialGradient>
            <radialGradient id="yor-haze"><stop stopColor="#b8c1d8" stopOpacity=".25"/><stop offset="1" stopColor="#b8c1d8" stopOpacity="0"/></radialGradient>
            <filter id="yor-ambient"><feGaussianBlur stdDeviation="14"/></filter>
          </defs>
          <circle cx="320" cy="320" r="286" fill="url(#yor-haze)"/>
          <g className="yor-artifact__geometry">
            {/* A kinetic architectural monogram: extruded plates, not orbital rings. */}
            <path d="M124 135L431 80L519 170L474 493L180 558L113 450Z" stroke="#bec7de" strokeOpacity=".22" strokeWidth="1.5"/>
            <path d="M146 143L427 95L501 174L461 478L187 539L129 443Z" fill="#131416" fillOpacity=".72" stroke="#b5bed4" strokeOpacity=".3" strokeWidth="1"/>
            <path d="M122 135L431 80L519 170" stroke="url(#yor-foil)" strokeOpacity=".8" strokeWidth="3"/>
            <path d="M519 170L474 493L180 558" stroke="url(#yor-steel)" strokeOpacity=".65" strokeWidth="3"/>
            <path d="M104 119L165 108M473 77L536 156M92 445L164 545M475 511L535 494" stroke="#a8b0c5" strokeOpacity=".35" strokeWidth="2"/>
            <g className="yor-artifact__module yor-artifact__module--a">
              <path d="M165 164L431 115L461 153L202 209Z" fill="url(#yor-steel)" stroke="#e2edff" strokeOpacity=".66" strokeWidth="1"/>
              <path d="M202 209L461 153L449 185L208 239Z" fill="#3d4047" stroke="#bbc4db" strokeOpacity=".55" strokeWidth="1"/>
              <path d="M185 177L402 137M216 223L417 180" stroke="#e4efff" strokeOpacity=".45" strokeWidth="1"/>
              <path d="M259 157L362 139" stroke="#d2dcf5" strokeWidth="4" strokeLinecap="square"/>
              <circle cx="193" cy="183" r="3" fill="#d7e1fc"/>
              <circle cx="433" cy="140" r="3" fill="#d7e1fc"/>
            </g>
            <g className="yor-artifact__module yor-artifact__module--b">
              <path d="M183 235L449 182L456 430L190 486Z" fill="#202125" stroke="url(#yor-foil)" strokeOpacity=".55" strokeWidth="2"/>
              <path d="M203 251L430 207L437 408L211 458Z" fill="#212226" fillOpacity=".92" stroke="#b5bed4" strokeOpacity=".23" strokeWidth="1"/>
              <path d="M217 278L415 239M222 420L422 380" stroke="#d3ddf7" strokeOpacity=".17"/>
              <path d="M186 240L128 251V321L158 344M453 225L520 219V292L488 306" stroke="#9ab0ff" strokeOpacity=".7" strokeWidth="2"/>
              <rect x="118" y="247" width="15" height="15" fill="#c2cce4"/>
              <rect x="513" y="212" width="15" height="15" fill="#9ab0ff"/>
              <circle cx="158" cy="344" r="4" fill="#ccd5ee"/>
              <circle cx="488" cy="306" r="4" fill="#9ab0ff"/>
            </g>
            <g className="yor-artifact__module yor-artifact__module--c">
              <path d="M188 475L454 421L469 457L191 516Z" fill="url(#yor-steel)" stroke="#dee9ff" strokeOpacity=".55" strokeWidth="1"/>
              <path d="M191 516L469 457L459 480L184 537Z" fill="#2b2d32" stroke="#b7bfd6" strokeOpacity=".4"/>
              <path d="M211 492L435 447" stroke="#d6e0fa" strokeOpacity=".7" strokeWidth="2"/>
              <path d="M230 510L410 474" stroke="#c0c9e0" strokeOpacity=".35"/>
              <path d="M248 530L386 503" stroke="#d0daf3" strokeOpacity=".28" strokeDasharray="2 6"/>
            </g>
            <g className="yor-artifact__wordmark">
              <path d="M204 286L425 241L432 377L211 422Z" fill="#151619" fillOpacity=".77"/>
              <text x="322" y="351" fontSize="124" textAnchor="middle" letterSpacing="-13" fontFamily="Georgia,serif" fontWeight="bold" fill="#111214" stroke="#111214" strokeWidth="4" transform="translate(5 8)">YOR</text>
              <text x="322" y="351" fontSize="124" textAnchor="middle" letterSpacing="-13" fontFamily="Georgia,serif" fontWeight="bold" fill="url(#yor-foil)" stroke="#d7e1fc" strokeOpacity=".56" strokeWidth=".8">YOR</text>
              <path d="M230 374H405" stroke="#c3cce4" strokeOpacity=".7" strokeWidth="1"/>
              <text x="320" y="392" fontSize="11" textAnchor="middle" letterSpacing="3" fontFamily="monospace" fill="#c9d3eb">DESIGN · BUILD · VERIFY</text>
            </g>
            <path d="M99 92H181M460 88H548M86 554H173M461 550H548" stroke="#c8d1e9" strokeOpacity=".28" strokeWidth=".8"/>
            <path d="M99 92V133M548 88V132M86 554V515M548 550V511" stroke="#c8d1e9" strokeOpacity=".28" strokeWidth=".8"/>
            <path d="M94 320H132M514 320H548" stroke="#d0daf3" strokeOpacity=".55" strokeWidth="1"/>
            <circle cx="94" cy="320" r="3" fill="#d5dff9"/>
            <circle cx="548" cy="320" r="3" fill="#d5dff9"/>
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
