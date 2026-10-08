import type { CSSProperties } from "react";
import Link from "next/link";
import { recruiterProjects } from "@/content/project-registry";
import { PROJECT_IDS, type ProjectId } from "@/experience/experience-state";
import { ProjectPreviewLink } from "./ProjectPreviewLink";

const projectIdSet = new Set<string>(PROJECT_IDS);

const summaries: Record<string, string> = {
  candidatex: "Making technical hiring evidence visible, traceable, and useful for better human decisions.",
  talks: "A home for conversations, communities, and the ideas that keep people connected.",
  helios: "Turning complex energy signals into an interface people can actually investigate.",
  zenith: "Exploring clearer decisions through thoughtful software and systems thinking.",
  "ai-vs-real": "An applied AI experiment in what images reveal, and what they cannot prove.",
  portfolio: "The design and engineering system behind this little corner of the internet.",
};

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
          <p className="machine-section-index"><span>01</span> / SELECTED WORK</p>
          <div>
            <h2 id="projects-title">Things I&apos;ve built.<br /><em>Ideas brought to life.</em></h2>
            <p>Not just a collection of tech stacks. These are problems I cared enough about to build something for. Pick one and explore what is real, experimental, and next.</p>
          </div>
          <span className="machine-section-heading__axis" aria-hidden="true">PROJECTS / 06</span>
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
              <article className={"machine-project reframe-project" + (index === 0 ? " reframe-project--featured" : "")} key={project.slug}>
                <ProjectPreviewLink
                  className="machine-project__preview"
                  projectId={projectId}
                  href={"/projects/" + project.slug}
                >
                  <span className="machine-project__art" style={artStyle} aria-hidden="true">
                    <span className="machine-project__index">{String(index + 1).padStart(2, "0")} / 06</span>
                    <span className="machine-project__art-label">{project.kicker}</span>
                    <span className="machine-project__art-coordinates">YOR / {project.period}</span>
                  </span>
                  <span className="machine-project__copy">
                    <span className="machine-project__kicker">{project.kicker}</span>
                    <span className="machine-project__title">{project.title}</span>
                    <span className="machine-project__purpose">{summaries[project.slug] ?? project.purpose}</span>
                    <span className="machine-project__open">EXPLORE THE PROJECT <span aria-hidden="true">↗</span></span>
                  </span>
                </ProjectPreviewLink>
                <div className="machine-project__meta">
                  <span>{project.status}</span>
                  <span>{project.technologies.slice(0, 3).join(" / ")}</span>
                  <nav aria-label={project.title + " project links"}>
                    {sourceVerified && <Link href={"/projects/" + project.slug + "/source"}>SOURCE ↗</Link>}
                    {liveVerified && <Link href={"/projects/" + project.slug + "/live"}>LIVE ↗</Link>}
                  </nav>
                </div>
              </article>
            );
          })}
        </div>

        <div className="reframe-work-outro">
          <p>Curious about the details, the tradeoffs, or the unfinished bits? That&apos;s where the good stuff lives.</p>
          <Link href="/projects">ALL PROJECTS <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
