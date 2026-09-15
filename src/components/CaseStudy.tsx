import { ActionLink } from "./ActionLink";
import { ClaimStrip } from "./ClaimStrip";
import { ProjectDemo } from "./ProjectDemo";
import { ProjectGallery } from "./ProjectGallery";
import { projects, type Project } from "@/content/projects";

export function CaseStudy({ project }: { project: Project }) {
  const index = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <main id="main">
      <section className="case-hero" aria-labelledby="case-title">
        <div className="container case-grid">
          <span className="technical" style={{ gridColumn: "1/-1" }}>{project.index} / {project.kicker} / case study</span>
          <h1 id="case-title" className="case-title">{project.title}</h1>
          <p className="case-summary">{project.purpose}</p>
          <dl className="case-meta">
            <div className="meta-row"><dt>Contribution</dt><dd>{project.role}</dd></div>
            {project.collaborators && <div className="meta-row"><dt>Credit</dt><dd>{project.collaborators}</dd></div>}
            <div className="meta-row"><dt>Period</dt><dd>{project.period}</dd></div>
            <div className="meta-row"><dt>Status</dt><dd>{project.status}</dd></div>
            <div className="meta-row"><dt>Evidence</dt><dd>{project.evidenceScope}</dd></div>
          </dl>
          <div className="case-media" style={{ backgroundImage: `url("${project.art}")` }}>
            <div className="case-media-caption"><span>Visual introduction / artwork</span><span>Not a live product capture</span></div>
          </div>
        </div>
      </section>

      <article className="container case-body">
        <section className="case-section">
          <h2>Problem.</h2>
          <div className="case-copy">
            <p>{project.problem}</p>
            <p><strong>Why it matters.</strong> {project.whyItMatters}</p>
            <p><strong>Workflow.</strong> {project.workflow}</p>
            <p><strong>Stack.</strong> {project.technologies.join(" · ")}</p>
          </div>
        </section>

        <section className="case-section">
          <h2>Constraints.</h2>
          <ul className="limit-list">{project.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul>
        </section>

        <section className="case-section">
          <h2>Decisions.</h2>
          <div className="decisions">{project.decisions.map((decision, itemIndex) => <div className="decision" key={decision.title}><span className="technical">0{itemIndex + 1}</span><h3>{decision.title}</h3><p>{decision.body}</p></div>)}</div>
        </section>

        <section className="case-section">
          <h2>Architecture.</h2>
          <div className="arch">{project.architecture.map((node) => <div className="node" key={node}>{node}</div>)}</div>
        </section>

        <ProjectGallery media={project.media} />

        <section className="case-section case-evidence">
          <h2>Evidence.</h2>
          <div className="case-copy"><p>{project.evidenceScope}</p><ClaimStrip claimIds={project.claimIds} /></div>
        </section>

        <ProjectDemo mode={project.slug as "yor-talks" | "helios" | "texture-forensics" | "zenith" | "token-usage"} art={project.art} />

        <section className="case-section">
          <h2>What changed.</h2>
          <div className="case-copy"><p>{project.hardPart}</p><p><strong>Outcome.</strong> {project.outcome}</p><ActionLink href={project.repo} external>Inspect source repository</ActionLink></div>
        </section>

        <section className="case-section">
          <h2>Limitations.</h2>
          <ul className="limit-list">{project.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
        </section>

        <section className="case-section">
          <h2>Next iteration.</h2>
          <div className="case-copy"><p>{project.nextIteration}</p><ul className="limit-list inline-list">{project.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul></div>
        </section>

        <nav className="case-nav" aria-label="Case study navigation"><ActionLink href="/#products">Back to selected work</ActionLink><ActionLink href={`/work/${next.slug}`} primary>Next · {next.title}</ActionLink></nav>
      </article>
    </main>
  );
}
