import Link from "next/link";
import { profile } from "@/content/profile";
import { StudioRoom } from "./StudioRoom";

/**
 * Lead with a clear professional identity and keep the interactive studio
 * as a distinctive, optional second path for visitors.
 */
export function StudioHero() {
  return (
    <section className="yor-world-hero" aria-labelledby="editorial-title" data-experience-section="identity">
      <div className="yor-world-hero__ambient" aria-hidden="true" />
      <div className="yor-world-hero__shell">
        <div className="yor-world-hero__eyebrow">
          <span className="yor-world-hero__led" aria-hidden="true" />
          <span>YOR / AYUSH ROY</span>
          <span className="yor-world-hero__edition">SOFTWARE ENGINEERING · INTERACTIVE WORK</span>
        </div>
        <div className="yor-world-hero__intro">
          <div className="yor-world-hero__identity">
            <p className="yor-world-hero__welcome">✳ &nbsp;ENGINEER. BUILDER. EXPERIMENTER.</p>
            <h1 id="editorial-title" data-essential-copy>
              Building systems.<br />
              <em>Making them matter.</em>
            </h1>
            <p className="yor-world-hero__description" data-essential-copy>
              I&apos;m Ayush Roy, a backend and full-stack engineer building
              evidence-driven tools, real-time products, and interactive experiences.
              Explore the work, inspect the code, or step inside my digital studio.
            </p>
            <div className="yor-world-hero__ctas">
              <a href="#projects" className="yor-world-hero__primary">Explore selected work <span aria-hidden="true">↗</span></a>
              <Link href="/resume" className="yor-world-hero__secondary">View résumé ↗</Link>
              <a href="#studio" className="yor-world-hero__secondary">Enter the 3D studio ↘</a>
            </div>
            <nav className="yor-world-hero__socials" aria-label="Professional profiles and contact">
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href={`mailto:${profile.email}`}>Get in touch ↗</a>
            </nav>
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
          <span>AN INTERACTIVE THREE.JS WORKSPACE</span>
          <Link href="/projects">VIEW THE ENGINEERING CASE STUDIES &nbsp; ↗</Link>
        </div>
      </div>
      <div className="yor-world-hero__ticker" aria-hidden="true">
        <div>BUILD WITH PURPOSE <span>✳</span> SHOW THE EVIDENCE <span>✳</span> KEEP EXPLORING <span>✳</span> BUILD WITH PURPOSE</div>
      </div>
    </section>
  );
}
