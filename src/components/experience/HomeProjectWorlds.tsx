import type { CSSProperties } from "react";
import Link from "next/link";
import { recruiterProjects } from "@/content/project-registry";
import { PROJECT_IDS, type ProjectId } from "@/experience/experience-state";
import { ProjectPreviewLink } from "./ProjectPreviewLink";

const projectIdSet = new Set<string>(PROJECT_IDS);

function toProjectId(slug: string): ProjectId {
  if (!projectIdSet.has(slug)) {
    throw new Error("Homepage project is missing a canonical experience world: " + slug);
  }
  return slug as ProjectId;
}

export function HomeProjectWorlds() {
  return (
    <section id="projects" className="machine-projects" data-experience-section="projects" aria-labelledby="projects-title">
      <div className="machine-container">
        <header className="machine-section-heading machine-projects__heading">
          <p className="machine-section-index"><span>01</span> / SYSTEMS IN THE FIELD</p>
          <div>
            <h2 id="projects-title">OPEN A SYSTEM.<br /><em>TRACE THE SIGNAL.</em></h2>
            <p>Follow each project from the problem and implementation to its evidence boundary and current limits.</p>
          </div>
          <span className="machine-section-heading__axis" aria-hidden="true">PROJECT WORLDS / 06</span>
        </header>

        <div className="machine-project-grid">
          {recruiterProjects.map((project, index) => {
            const projectId = toProjectId(project.slug);
            const sourceVerified = project.availability.source === "verified" && Boolean(project.links.source);
            const liveVerified = project.availability.live === "verified" && Boolean(project.links.live);
            const artStyle = {
              "--project-art": 'url("' + project.art + '")',
            } as CSSProperties;

            return (
              <article className="machine-project" key={project.slug}>
                <ProjectPreviewLink
                  className="machine-project__preview"
                  projectId={projectId}
                  href={"/projects/" + project.slug}
                >
                  <span className="machine-project__art" style={artStyle} aria-hidden="true">
                    <span className="machine-project__index">{String(index + 1).padStart(2, "0")} / {project.period}</span>
                    <span className="machine-project__art-label">{project.kicker}</span>
                    <span className="machine-project__art-coordinates" aria-hidden="true">YOR / FIELD NOTE</span>
                  </span>
                  <span className="machine-project__copy">
                    <span className="machine-project__kicker">{project.kicker}</span>
                    <span className="machine-project__title">{project.title}</span>
                    <span className="machine-project__purpose">{project.purpose}</span>
                    <span className="machine-project__open">OPEN CASE STUDY <span aria-hidden="true">↗</span></span>
                  </span>
                </ProjectPreviewLink>
                <div className="machine-project__meta">
                  <span>{project.status}</span>
                  <span>{project.technologies.slice(0, 3).join(" / ")}</span>
                  <nav aria-label={project.title + " project links"}>
                    {sourceVerified && <Link href={"/projects/" + project.slug + "/source"}>SOURCE</Link>}
                    {liveVerified && <Link href={"/projects/" + project.slug + "/live"}>LIVE</Link>}
                  </nav>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
