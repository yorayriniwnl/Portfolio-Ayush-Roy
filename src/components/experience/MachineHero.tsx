import Link from "next/link";
import { profile } from "@/content/profile";

export function MachineHero() {
  return (
    <section className="machine-hero" data-experience-section="identity" aria-labelledby="hero-title">
      <div className="machine-container machine-hero__frame">
        <div className="machine-hero__identity">
          <p className="machine-hero__eyebrow">
            <span className="machine-signal-dot" aria-hidden="true" />
            AYUSH ROY / PRODUCT ENGINEER / 2026
          </p>
          <p className="machine-hero__wordmark" aria-label="YOR" aria-hidden="true">
            <span>Y</span><span>O</span><span>R</span>
          </p>
          <h1 id="hero-title" className="machine-hero__statement" data-essential-copy>
            <span>I BUILD SYSTEMS</span>{" "}
            <span>THAT MOVE.</span>
          </h1>
          <p className="machine-hero__discipline" data-essential-copy>
            <span>FULL STACK</span>{" "}<i aria-hidden="true">•</i>{" "}
            <span>AI SYSTEMS</span>{" "}<i aria-hidden="true">•</i>{" "}
            <span>INTERACTIVE 3D</span>
          </p>
          <div className="machine-hero__actions" aria-label="Primary actions">
            <a className="machine-action machine-action--primary" href="#projects">
              <span>Explore Work</span><span aria-hidden="true">↓</span>
            </a>
            <Link className="machine-action" href="/resume">
              <span>Resume</span><span aria-hidden="true">↗</span>
            </Link>
            <a className="machine-action" href={profile.links.github} target="_blank" rel="noopener noreferrer">
              <span>GitHub</span><span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="machine-hero__coordinates">
          <p><span>ROLE</span><strong>{profile.role}</strong></p>
          <p><span>BASE</span><strong>{profile.location}</strong></p>
          <a href="#projects"><span>SCROLL TO ENTER</span><span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <span className="machine-hero__axis" aria-hidden="true">YOR // THE MACHINE</span>
    </section>
  );
}
