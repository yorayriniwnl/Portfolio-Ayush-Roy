import Link from "next/link";
import type { Project } from "@/content/projects";
import { getCanonicalProjectSlug, projectLinkPath, projectPath } from "@/content/project-system";
import { ProjectPreviewLink } from "@/components/experience/ProjectPreviewLink";

export function ProjectIndex({ projects }: { projects: readonly Project[] }) {
  const publicProjects = projects.filter((project) => project.visibility.portfolio);
  const projectCount = publicProjects.length;

  return (
    <main id="main" className="projects-index">
      <section className="projects-index-hero" aria-labelledby="projects-title">
        <div className="container">
          <span className="technical">YOR / SELECTED ENGINEERING WORK</span>
          <h1 id="projects-title" className="display">Projects<br /><em>with receipts.</em></h1>
          <p className="projects-index-deck" data-essential-copy>Six canonical project worlds. Each case study keeps the work, evidence, contribution boundary, and limitations in the same frame.</p>
          <div className="projects-index-proof" aria-label="Project index rules">
            <span><b>{String(projectCount).padStart(2, "0")}</b> canonical case studies</span>
            <span><b>01</b> source of truth</span>
            <span><b>0</b> fabricated deployments</span>
          </div>
        </div>
      </section>

      <section className="container projects-index-list" aria-labelledby="selected-projects-title">
        <div className="projects-index-heading">
          <div><span className="technical">01 / THE SELECTED SET</span><h2 id="selected-projects-title">Read the<br /><em>engineering.</em></h2></div>
          <p>Open a project for the architecture, validation evidence, and limitations. Verified source and live routes remain explicit.</p>
        </div>
        <ol className="project-world-list" aria-label="Selected engineering project worlds">
          {publicProjects.map((project, index) => {
            const slug = getCanonicalProjectSlug(project.slug);
            if (!slug) throw new Error(`Project index received a noncanonical project: ${project.slug}`);
            const href = projectPath(slug);
            const displayNumber = String(index + 1).padStart(2, "0");

            return (
              <li key={slug}>
                <article
                  className="project-world"
                  data-project-slug={slug}
                  data-display-number={displayNumber}
                  data-registry-index={project.index}
                >
                  <div className="project-world__art" style={{ backgroundImage: `url("${project.art}")` }} aria-hidden="true">
                    <span className="technical">WORLD / {displayNumber}</span>
                    <span className="technical">{project.period}</span>
                  </div>
                  <div className="project-world__body">
                    <div className="project-world__metadata">
                      <span className="technical">{displayNumber} / REGISTRY {project.index}</span>
                      <span className="technical project-world__status">{project.status}</span>
                    </div>
                    <span className="technical project-world__kicker">{project.kicker}</span>
                    <h3>
                      <ProjectPreviewLink
                        projectId={slug}
                        href={href}
                        className="project-world__title-link"
                        ariaLabel={`Open ${project.title} case study`}
                      >
                        {project.title}
                      </ProjectPreviewLink>
                    </h3>
                    <p className="project-world__purpose">{project.purpose}</p>
                    <ul className="project-world__technologies" aria-label={`${project.title} core technologies`}>
                      {project.technologies.slice(0, 4).map((technology) => <li key={technology}>{technology}</li>)}
                    </ul>
                    {project.metrics.length > 0 && <dl className="project-world__metrics">
                      {project.metrics.slice(0, 2).map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}<small>{metric.context}</small></dd></div>)}
                    </dl>}
                    <div className="actions project-world__actions" aria-label={`${project.title} project actions`}>
                      <Link className="action primary" href={href}>Case study</Link>
                      {project.availability.source === "verified" && project.links.source && <Link className="action" href={projectLinkPath(slug, "source")}>Source</Link>}
                      {project.availability.live === "verified" && project.links.live && <Link className="action" href={projectLinkPath(slug, "live")}>View live</Link>}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
