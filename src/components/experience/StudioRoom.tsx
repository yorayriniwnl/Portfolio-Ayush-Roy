"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StudioTarget } from "./StudioScene";

const Scene = dynamic(
  () => import("./StudioScene").then((module) => module.StudioScene),
  { ssr: false, loading: () => null },
);

const destinations: Record<StudioTarget, { number: string; title: string; label: string; description: string; href: string; cta: string }> = {
  work: {
    number: "01", title: "The workstation", label: "SELECTED ENGINEERING",
    description: "Open the computer to explore CandidateX, an evidence-first approach to technical assessment.",
    href: "/projects/candidatex", cta: "EXPLORE CANDIDATEX",
  },
  about: {
    number: "02", title: "The human behind it", label: "MEET THE BUILDER",
    description: "The avatar might turn to say hello. Meet the engineer behind the projects.",
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

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
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
    <div className="yor-studio" ref={root}>
      <div className="yor-studio__topline">
        <span><i className="yor-studio__pulse"/> A LITTLE CORNER OF MY UNIVERSE</span>
        <span>YOR / ROOM_001</span>
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
        {allowed && visible && <Scene onSelect={setSelected}/>}
        <div className="yor-studio__hud" aria-hidden="true">
          <span>INTERACTIVE WORKSPACE</span><span>EXPLORE THE OBJECTS ↗</span>
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
      <p className="yor-studio__access-note">Explore with your mouse or use the buttons. A reduced-motion, no-3D view is available automatically.</p>
    </div>
  );
}
