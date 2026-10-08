import Link from "next/link";
import { profile } from "@/content/profile";
import { StudioRoom } from "./StudioRoom";

export function MachineHero() {
  return (
    <section className="machine-hero" data-experience-section="identity" aria-labelledby="hero-title">
      <div className="machine-container machine-hero__frame">
        <div className="yor-hero-grid">
          <div className="yor-hero-eyebrow"><span className="machine-signal-dot" aria-hidden="true" />
            <span>AYUSH ROY / SOFTWARE ENGINEER</span>
          </div>
          <div className="yor-hero-greeting"><span className="yor-hero-stars" aria-hidden="true">✳</span> Hey, welcome to my world.</div>
          <h1 id="hero-title" className="machine-hero__statement" data-essential-copy>
            <span>I build things</span>{" "}<span>that feel alive.</span>
          </h1>
          <StudioRoom />
          <p className="yor-hero-lede" data-essential-copy>
            I&apos;m Ayush, a full-stack engineer who loves making ambitious ideas real.
            From serious backend systems to playful digital worlds, I care about how the whole thing feels.
          </p>
          <div className="machine-hero__discipline" data-essential-copy>
            <span>FULL STACK</span> <i aria-hidden="true">✳</i> <span>AI SYSTEMS</span>
            <i aria-hidden="true">✳</i> <span>INTERACTIVE 3D</span>
          </div>
          <div className="machine-hero__actions" aria-label="Primary actions">
            <a className="machine-action machine-action--primary" href="#projects"><span>See what I&apos;ve built</span><span aria-hidden="true">↗</span></a>
            <Link className="machine-action" href="/resume"><span>My résumé</span><span aria-hidden="true">↗</span></Link>
            <a className="machine-action" href={profile.links.github} target="_blank" rel="noopener noreferrer"><span>GitHub</span><span aria-hidden="true">↗</span></a>
          </div>
          <p className="yor-hero-aside">Some projects solve problems. Some start conversations.<br/>The best ones do both.</p>
        </div>
        <div className="machine-hero__coordinates">
          <p><span>WHAT I DO</span><strong>{profile.headline}</strong></p>
          <p><span>LOCATION</span><strong>{profile.location}</strong></p>
          <a href="#projects"><span>KEEP EXPLORING</span><span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <span className="machine-hero__axis" aria-hidden="true">YOR / THE INTERACTIVE PORTFOLIO</span>
    </section>
  );
}
