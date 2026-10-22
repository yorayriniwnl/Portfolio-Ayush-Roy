import Link from "next/link";
import { recruiterProjects } from "@/content/project-registry";
import { StudioRoom } from "./StudioRoom";

const startingPoints = recruiterProjects.slice(0, 3);

/**
 * Recruiter-first content is available in server-rendered HTML.
 * The optional room retains its interactive, progressively loaded 3D scene.
 */
export function StudioHero() {
  return (
    <section className="yor-world-hero" aria-labelledby="editorial-title" data-experience-section="identity">
      <div className="yor-world-hero__ambient" aria-hidden="true" />
      <div className="yor-world-hero__shell">
        <div className="yor-world-hero__eyebrow">
          <span className="yor-world-hero__led" aria-hidden="true" />
          <span>YOR / AYUSH ROY</span>
          <span className="yor-world-hero__edition">SOFTWARE ENGINEERING · 2026</span>
        </div>

        <div className="yor-world-hero__intro">
          <div className="yor-world-hero__identity">
            <p className="yor-world-hero__welcome">BACKEND ENGINEERING / FULL STACK / APPLIED ML</p>
            <h1 id="editorial-title" data-essential-copy>
              I build systems.<br />
              <em>You can inspect them.</em>
            </h1>
            <p className="yor-world-hero__description" data-essential-copy>
              I&apos;m Ayush Roy. I turn complex problems into useful software,
              from evidence-first AI tools to realtime products. Explore the code,
              architecture, decisions, and limits behind the work.
            </p>
            <div className="yor-world-hero__ctas">
              <Link href="/projects" className="yor-world-hero__primary">Explore my work <span aria-hidden="true">↗</span></Link>
              <Link href="/resume" className="yor-world-hero__secondary">View résumé <span aria-hidden="true">↗</span></Link>
              <a href="#studio" className="yor-world-hero__tertiary">Enter 3D studio <span aria-hidden="true">↓</span></a>
            </div>
          </div>

          <nav className="yor-world-hero__fast-path" aria-label="Featured engineering case studies">
            <div className="yor-world-hero__fast-path-label">
              <span>START WITH THE WORK</span>
              <strong>Selected engineering</strong>
            </div>
            <div className="yor-world-hero__fast-path-links">
              {startingPoints.map((project, index) => (
                <Link className="yor-world-hero__fast-path-link" href={`/projects/${project.slug}`} key={project.slug}>
                  <span className="yor-world-hero__fast-path-meta">{String(index + 1).padStart(2, "0")} / {project.kicker}</span>
                  <strong>{project.title}</strong>
                  <span className="yor-world-hero__fast-path-arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div id="studio" className="yor-world-hero__studio machine-home">
          <div className="yor-world-hero__studio-heading">
            <div>
              <span>THE INTERACTIVE STUDIO / OPTIONAL</span>
              <h2>Explore the world behind the work.</h2>
            </div>
            <p>The room is a creative detour. Every project is also one click away without WebGL.</p>
          </div>
          <StudioRoom />
        </div>
        <div className="yor-world-hero__below">
          <span><b>YOR / STUDIO</b> &nbsp; DESIGN · ENGINEERING · INTERACTION</span>
          <span>WEBGL / FALLBACK AVAILABLE</span>
          <Link href="/projects">SKIP THE TOUR, SEE THE PROJECTS &nbsp; ↗</Link>
        </div>
      </div>
      <div className="yor-world-hero__ticker" aria-hidden="true">
        <div>BUILD IT WELL <span>✳</span> SHOW THE WORK <span>✳</span> TEST THE ASSUMPTIONS <span>✳</span> KEEP LEARNING</div>
      </div>
    </section>
  );
}
