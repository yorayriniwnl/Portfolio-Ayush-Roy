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
    <div ref={root} className="yor-artifact" role="group" data-paused={paused} data-visible={inView} data-reduced-motion={reducedMotion} aria-label="Interactive YOR editorial letterform study">
      <div className="yor-artifact__top"><span><span className="yor-artifact__asterisk">✳</span> YOR / THE LETTERFORM STUDY</span><span>EDITION 001</span></div>
      <div className="yor-artifact__stage" ref={frame} data-mode={active} onPointerMove={move} onPointerLeave={reset}>
        <div className="yor-artifact__grid" aria-hidden="true" />
        <div className="yor-artifact__halo" aria-hidden="true" />
        <span className="yor-artifact__axis yor-artifact__axis--top" aria-hidden="true">THOUGHTFUL BY DESIGN</span>
        <span className="yor-artifact__axis yor-artifact__axis--bottom" aria-hidden="true">BUILT TO HOLD UP</span>
        <svg className="yor-artifact__sculpture" viewBox="0 0 640 640" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="yor-satin" x1="65" y1="120" x2="573" y2="510" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F6F4EF" />
              <stop offset=".31" stopColor="#D7D3C8" />
              <stop offset=".62" stopColor="#85857E" />
              <stop offset="1" stopColor="#F1EEE6" />
            </linearGradient>
            <linearGradient id="yor-glass" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#F0EEE6" stopOpacity=".12" />
              <stop offset="1" stopColor="#F0EEE6" stopOpacity=".015" />
            </linearGradient>
          </defs>
          <g className="yor-artifact__geometry">
            <path d="M42 108H598M42 531H598" stroke="#D9D5C9" strokeOpacity=".16" strokeWidth="1"/>
            <path d="M57 94V125M583 94V125M57 514V545M583 514V545" stroke="#C2C0B6" strokeOpacity=".35" strokeWidth="1"/>
            <g className="yor-artifact__module yor-artifact__module--a">
              <path d="M85 175L237 148L237 455L85 482Z" fill="#1B1B19" stroke="#D9D5C9" strokeOpacity=".34" strokeWidth="1.3" />
              <path d="M93 183L229 159L229 446L93 469Z" fill="url(#yor-glass)" />
              <text x="161" y="368" fontSize="223" fontWeight="500" letterSpacing="-14" textAnchor="middle" fontFamily="Georgia,serif" fill="url(#yor-satin)">Y</text>
              <path d="M103 448H220" stroke="#F1EFE7" strokeOpacity=".3" />
              <text x="106" y="460" fontSize="8" letterSpacing="2" fill="#DFDAD0">01 / MAKE</text>
            </g>
            <g className="yor-artifact__module yor-artifact__module--b">
              <path d="M245 144L397 117L397 424L245 451Z" fill="#1E1E1B" stroke="#F2EFE8" strokeOpacity=".47" strokeWidth="1.3" />
              <path d="M253 152L389 128L389 415L253 438Z" fill="url(#yor-glass)" />
              <text x="321" y="333" fontSize="195" fontWeight="400" letterSpacing="-14" textAnchor="middle" fontFamily="Georgia,serif" fill="url(#yor-satin)">O</text>
              <path d="M263 418H379" stroke="#F1EFE7" strokeOpacity=".3" />
              <text x="267" y="431" fontSize="8" letterSpacing="2" fill="#DFDAD0">02 / THINK</text>
            </g>
            <g className="yor-artifact__module yor-artifact__module--c">
              <path d="M405 180L557 153L557 460L405 487Z" fill="#1B1B19" stroke="#D9D5C9" strokeOpacity=".34" strokeWidth="1.3" />
              <path d="M413 188L549 164L549 451L413 474Z" fill="url(#yor-glass)" />
              <text x="481" y="373" fontSize="217" fontWeight="400" letterSpacing="-14" textAnchor="middle" fontFamily="Georgia,serif" fill="url(#yor-satin)">R</text>
              <path d="M422 454H540" stroke="#F1EFE7" strokeOpacity=".3" />
              <text x="425" y="468" fontSize="8" letterSpacing="2" fill="#DFDAD0">03 / REFINE</text>
            </g>
            <path d="M58 501H155M484 117H580" stroke="#BFBDB3" strokeOpacity=".28" strokeDasharray="4 8"/>
            <circle cx="57" cy="501" r="2.5" fill="#E6E0D4" />
            <circle cx="583" cy="117" r="2.5" fill="#E6E0D4" />
            <text x="320" y="576" textAnchor="middle" fontSize="10" letterSpacing="3.5" fontFamily="monospace" fill="#B6B3AA">YOR / INDEPENDENT ENGINEERING</text>
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
      <p className="sr-only">An original editorial YOR letterform composed of three separate moving typographic panels. Select Create, Connect or Refine to explore the philosophy; pause the motion if preferred.</p>
    </div>
  );
}
