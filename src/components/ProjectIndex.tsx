import Link from "next/link";
import type { Project } from "@/content/projects";

export function ProjectIndex({ projects }: { projects: readonly Project[] }) {
  const publicProjects = projects.filter((project) => project.visibility.portfolio);

  return (
    <main id="main" className="projects-index">
      <section className="projects-index-hero" aria-labelledby="projects-title">
        <div className="container">
          <span className="technical">YOR / SELECTED ENGINEERING WORK</span>
          <h1 id="projects-title" className="display">Projects<br /><em>with receipts.</em></h1>
          <p className="projects-index-deck">Six CV projects, presented as one coherent system: understand the work, experience a verified deployment when one exists, then inspect the source.</p>
          <div className="projects-index-proof" aria-label="Project index rules">
            <span><b>06</b> canonical case studies</span>
            <span><b>01</b> source of truth</span>
            <span><b>0</b> fabricated deployments</span>
          </div>
        </div>
      </section>

      <section className="container projects-index-list" aria-labelledby="selected-projects-title">
        <div className="projects-index-heading">
          <div><span className="technical">01 / THE SELECTED SET</span><h2 id="selected-projects-title">Read the<br /><em>engineering.</em></h2></div>
          <p>Each page keeps the recruiter summary close to the architecture, contribution boundary, validation evidence, and limitations. Availability is explicit.</p>
        </div>
        <div className="projects-index-grid">
          {publicProjects.map((project) => (
            <article key={project.slug} className="project-index-card" data-project-slug={project.slug}>
              <div className="project-index-art" style={{ backgroundImage: `url("${project.art}")` }}>
                <span className="technical">{project.index} / {project.period}</span>
                <span className="technical">{project.status}</span>
              </div>
              <div className="project-index-card-body">
                <span className="technical project-index-kicker">{project.kicker}</span>
                <h3><a href={`/projects/${project.slug}`}>{project.title}</a></h3>
                <p>{project.purpose}</p>
                <ul className="project-index-tags" aria-label={`${project.title} core technologies`}>
                  {project.technologies.slice(0, 4).map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
                {project.metrics.length > 0 && <dl className="project-index-metrics">
                  {project.metrics.slice(0, 2).map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}<small>{metric.context}</small></dd></div>)}
                </dl>}
                <div className="actions project-index-actions">
                  <Link className="action primary" href={`/projects/${project.slug}`}>Case study</Link>
                  {project.availability.source === "verified" && project.links.source && <Link className="action" href={`/projects/${project.slug}/source`}>Source</Link>}
                  {project.availability.live === "verified" && project.links.live && <Link className="action" href={`/projects/${project.slug}/live`}>View live</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
