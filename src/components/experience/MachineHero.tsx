import Link from "next/link";
import { profile } from "@/content/profile";

export function MachineHero() {
  return (
    <section className="machine-hero" data-experience-section="identity" aria-labelledby="hero-title">
      <div className="machine-container machine-hero__frame">
        <div className="reframe-hero__layout">
          <div className="machine-hero__identity">
            <p className="machine-hero__eyebrow">
              <span className="machine-signal-dot" aria-hidden="true" />
              AYUSH ROY / BACKEND + FULL STACK / 2026
            </p>
            <p className="machine-hero__wordmark" aria-label="YOR" aria-hidden="true">
              <span>Y</span><span>O</span><span>R</span>
            </p>
            <p className="reframe-hero__kicker">ENGINEER BY TRAINING. BUILDER BY INSTINCT.</p>
            <h1 id="hero-title" className="machine-hero__statement" data-essential-copy>
              <span>I BUILD SYSTEMS</span>{" "}
              <span>THAT MOVE.</span>
            </h1>
            <p className="reframe-hero__intro" data-essential-copy>
              Hey, I&apos;m Ayush. I turn ambitious ideas into working software,
              from the logic behind the screen to the experience in front of it.
            </p>
            <p className="machine-hero__discipline" data-essential-copy>
              <span>FULL STACK</span>{" "}<i aria-hidden="true">•</i>{" "}
              <span>AI SYSTEMS</span>{" "}<i aria-hidden="true">•</i>{" "}
              <span>INTERACTIVE 3D</span>
            </p>
            <div className="machine-hero__actions" aria-label="Primary actions">
              <a className="machine-action machine-action--primary" href="#projects">
                <span>Explore Work</span><span aria-hidden="true">↗</span>
              </a>
              <Link className="machine-action" href="/resume">
                <span>Resume</span><span aria-hidden="true">↗</span>
              </Link>
              <a className="machine-action" href={profile.links.github} target="_blank" rel="noopener noreferrer">
                <span>GitHub</span><span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="reframe-hero__note">
              <span className="reframe-hero__note-mark" aria-hidden="true">✳</span>
              <span>Selected engineering work, experiments, and ideas in motion.</span>
            </div>
          </div>

          <div className="reframe-hero__visual">
            <div className="reframe-hero__aura" aria-hidden="true" />
            <div className="reframe-hero__halo" aria-hidden="true" />
            <div className="reframe-hero__view-label" aria-hidden="true">THE WORKSPACE / VOL. 01</div>
            <Link className="reframe-hero__screen" href="/projects/candidatex" aria-label="Explore the CandidateX case study">
              <div className="reframe-hero__screen-top">
                <span className="reframe-hero__screen-lights"><i /><i /><i /></span>
                <span>YOR / FEATURED BUILD</span>
                <span>↗</span>
              </div>
              <div className="reframe-hero__screen-media">
                <div className="reframe-hero__screen-scan" aria-hidden="true" />
                <div className="reframe-hero__screen-caption">
                  <small>01 / RESEARCH + SOFTWARE</small>
                  <strong>CandidateX<span>.</span></strong>
                  <span>Evidence-driven hiring research prototype</span>
                </div>
              </div>
              <div className="reframe-hero__screen-bottom">
                <span><i /> CASE STUDY AVAILABLE</span>
                <span>VIEW PROJECT ↗</span>
              </div>
            </Link>
            <div className="reframe-hero__floating reframe-hero__floating--upper" aria-hidden="true">
              <span>BUILD PHILOSOPHY</span>
              <strong>Curiosity → Code → Craft</strong>
            </div>
            <div className="reframe-hero__floating reframe-hero__floating--lower" aria-hidden="true">
              <span>WELCOME TO THE UNIVERSE OF</span>
              <strong>YOR <i>✳</i> AYRIN</strong>
            </div>
            <div className="reframe-hero__visual-foot" aria-hidden="true"><span>EXPERIMENT / ITERATE / SHIP</span><span>INDIA · 2026</span></div>
          </div>
        </div>

        <div className="machine-hero__coordinates">
          <p><span>ROLE</span><strong>{profile.headline}</strong></p>
          <p><span>BASE</span><strong>{profile.location}</strong></p>
          <a href="#projects"><span>SCROLL TO EXPLORE</span><span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <span className="machine-hero__axis" aria-hidden="true">YOR // INDEPENDENTLY BUILT</span>
    </section>
  );
}
