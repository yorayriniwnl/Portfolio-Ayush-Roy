import Link from "next/link";
import { profile } from "@/content/profile";
import { StudioRoom } from "./StudioRoom";

/**
 * A 3D-first entrance: semantic content loads with HTML, while the actual
 * recovered Three.js room mounts on capable devices after entering the viewport.
 */
export function StudioHero() {
  return (
    <section className="yor-world-hero" aria-labelledby="editorial-title" data-experience-section="identity">
      <div className="yor-world-hero__ambient" aria-hidden="true" />
      <div className="yor-world-hero__shell">
        <div className="yor-world-hero__eyebrow">
          <span className="yor-world-hero__led" aria-hidden="true" />
          <span>YOR / PERSONAL UNIVERSE</span>
          <span className="yor-world-hero__edition">INTERACTIVE PORTFOLIO · 2026</span>
        </div>
        <div className="yor-world-hero__intro">
          <div className="yor-world-hero__identity">
            <p className="yor-world-hero__welcome">✳ &nbsp;WELCOME TO MY WORLD</p>
            <h1 id="editorial-title" data-essential-copy>
              Not another<br />
              <em>portfolio.</em>
            </h1>
            <p className="yor-world-hero__description" data-essential-copy>
              I&apos;m Ayush. A full-stack developer building real software and
              strange little digital worlds. Come inside my workspace.
            </p>
            <div className="yor-world-hero__ctas">
              <a href="#studio" className="yor-world-hero__primary">Explore the 3D room <span aria-hidden="true">↘</span></a>
              <a href="#projects" className="yor-world-hero__secondary">See my projects ↗</a>
            </div>
          </div>
          <div className="yor-world-hero__ornament" aria-hidden="true">
            <span>Y</span><span>O</span><span>R</span>
            <small>YOU ARE INSIDE MY UNIVERSE</small>
          </div>
        </div>
        <div id="studio" className="yor-world-hero__studio machine-home">
          <StudioRoom />
        </div>
        <div className="yor-world-hero__below">
          <span><b>01 / 06</b> &nbsp; ENGINEERING · DESIGN · 3D</span>
          <span>BUILT WITH THREE.JS / REAL INTERACTIONS</span>
          <Link href="/resume">THE HUMAN BEHIND THE ROOM &nbsp; ↗</Link>
        </div>
      </div>
      <div className="yor-world-hero__ticker" aria-hidden="true">
        <div>CODE IS A CRAFT <span>✳</span> EXPLORE THE WORKSPACE <span>✳</span> BUILD SOMETHING THAT MATTERS <span>✳</span> CODE IS A CRAFT</div>
      </div>
    </section>
  );
}
