import Link from "next/link";
import { StudioRoom } from "./StudioRoom";

/**
 * Recruiter-first introduction. The interactive studio remains an optional,
 * progressive enhancement rather than the sole route into the work.
 */
export function StudioHero() {
  return (
    <section className="yor-world-hero yor-world-hero--recruiter" aria-labelledby="editorial-title" data-experience-section="identity">
      <div className="yor-world-hero__ambient" aria-hidden="true" />
      <div className="yor-world-hero__shell">
        <div className="yor-world-hero__eyebrow">
          <span className="yor-world-hero__led" aria-hidden="true" />
          <span>AYUSH ROY / SOFTWARE ENGINEERING</span>
          <span className="yor-world-hero__edition">SELECTED WORK · 2026</span>
        </div>
        <div className="yor-world-hero__intro">
          <div className="yor-world-hero__identity">
            <p className="yor-world-hero__welcome">FULL-STACK DEVELOPMENT · BACKEND SYSTEMS · APPLIED ML</p>
            <h1 id="editorial-title" data-essential-copy>
              Building software<br />
              <em>that works.</em>
            </h1>
            <p className="yor-world-hero__description" data-essential-copy>
              I&apos;m Ayush Roy. I design and build full-stack products,
              real-time systems, and applied machine-learning tools.
              Explore six documented projects, with source code and honest
              technical decisions behind each one.
            </p>
            <div className="yor-world-hero__ctas">
              <a href="#projects" className="yor-world-hero__primary">Explore selected work <span aria-hidden="true">↗</span></a>
              <Link href="/resume" className="yor-world-hero__secondary">View résumé <span aria-hidden="true">↗</span></Link>
            </div>
            <p className="yor-world-hero__proof">06 documented projects <span aria-hidden="true">/</span> Open-source evidence <span aria-hidden="true">/</span> Graduating 2027</p>
            <a href="#studio" className="yor-world-hero__studio-jump">Or explore the interactive 3D studio <span aria-hidden="true">↓</span></a>
          </div>
          <nav className="yor-world-hero__feature" aria-label="Featured engineering projects">
            <p className="yor-world-hero__feature-label">START HERE / FEATURED SYSTEMS</p>
            <Link href="/projects/candidatex" className="yor-world-hero__feature-item"><span>01 / CAPABILITY INTELLIGENCE</span><strong>CandidateX</strong><small>Role-aware assessment using multi-source evidence <span aria-hidden="true">↗</span></small></Link>
            <Link href="/projects/helios" className="yor-world-hero__feature-item"><span>02 / REAL-TIME SYSTEMS</span><strong>Yor Helios</strong><small>Streaming anomaly-detection architecture <span aria-hidden="true">↗</span></small></Link>
            <Link href="/projects/zenith" className="yor-world-hero__feature-item"><span>03 / ENERGY SOFTWARE</span><strong>Yor Zenith</strong><small>Energy planning and interactive analysis <span aria-hidden="true">↗</span></small></Link>
            <Link href="/projects" className="yor-world-hero__feature-all">View all six case studies <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
        <div id="studio" className="yor-world-hero__studio machine-home">
          <div className="yor-world-hero__studio-heading"><div><p>THE EXPERIMENTAL SIDE</p><h2>Step inside the studio.</h2></div><span>Interactive 3D / Optional experience</span></div>
          <StudioRoom />
        </div>
        <div className="yor-world-hero__below">
          <span><b>01 / 06</b> &nbsp; ENGINEERING FIRST. EXPLORATION ALWAYS.</span>
          <Link href="/lab">Explore the lab ↗</Link>
          <a href="#about">Meet the engineer ↗</a>
        </div>
      </div>
    </section>
  );
}
