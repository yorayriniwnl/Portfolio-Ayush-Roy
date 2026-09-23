import { ActionLink } from "./ActionLink";
import { ClaimStrip } from "./ClaimStrip";
import { ProjectInteractionPanel } from "./ProjectInteractionPanel";
import { ProjectGallery } from "./ProjectGallery";
import { cvProjects, recruiterProjects } from "@/content/project-registry";
import type { Project } from "@/content/projects";

function CaseSection({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="case-section" data-experience-section="projects" data-case-section={id}>
      <h2><span className="technical">{number}</span>{title}.</h2>
      {children}
    </section>
  );
}

function Copy({ children }: { children: React.ReactNode }) {
  return <div className="case-copy">{children}</div>;
}

function EvidenceList({ items }: { items: readonly string[] }) {
  return <ul className="limit-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function CaseStudy({ project }: { project: Project }) {
  const isCvProject = cvProjects.some((candidate) => candidate.slug === project.slug);
  const index = recruiterProjects.findIndex((item) => item.slug === project.slug);
  const next = isCvProject && index >= 0 ? recruiterProjects[(index + 1) % recruiterProjects.length] : undefined;

  return (
    <main id="main" data-experience-project={project.slug}>
      <section className="case-hero" aria-labelledby="case-title" data-experience-section="projects" data-case-section="hero">
        <div className="container case-grid">
          <span className="technical case-kicker" style={{ gridColumn: "1/-1" }}>{project.index} / {project.kicker} / case study</span>
          <h1 id="case-title" className="case-title">{project.title}</h1>
          <p className="case-summary">{project.purpose}</p>
          <dl className="case-meta">
            <div className="meta-row"><dt>My role</dt><dd>{project.role}</dd></div>
            <div className="meta-row"><dt>Status</dt><dd>{project.status}</dd></div>
            <div className="meta-row"><dt>Period</dt><dd>{project.period}</dd></div>
            <div className="meta-row"><dt>Stack</dt><dd>{project.technologies.join(" · ")}</dd></div>
            {project.collaborators && <div className="meta-row"><dt>Collaborators</dt><dd>{project.collaborators}</dd></div>}
          </dl>
          <div className="case-hero-actions actions">
            {isCvProject && project.availability.live === "verified" && project.links.live && <ActionLink href={`/projects/${project.slug}/live`} primary>View live</ActionLink>}
            {isCvProject && project.availability.source === "verified" && project.links.source && <ActionLink href={`/projects/${project.slug}/source`} primary={!project.links.live}>Source</ActionLink>}
            {!isCvProject && project.links.source && <ActionLink href={project.links.source} external primary>Inspect source</ActionLink>}
          </div>
          <div className="case-media" style={{ backgroundImage: `url("${project.art}")` }}>
            <div className="case-media-caption"><span>Visual introduction / artwork</span><span>Not a live product capture</span></div>
          </div>
        </div>
      </section>

      <nav className="case-toc" aria-label="Case study sections">
        <div className="container case-toc-inner">
          <a href="#overview">Overview</a>
          <a href="#contribution">Contribution</a>
          <a href="#architecture">Architecture</a>
          <a href="#implementation">Implementation</a>
          <a href="#testing">Validation</a>
          <a href="#results">Evidence</a>
          {project.media.length > 0 && <a href="#gallery">Visuals</a>}
          <a href="#limitations">Limits</a>
          <a href="#next-iteration">Next</a>
        </div>
      </nav>

      <article className="container case-body">
        <CaseSection id="overview" number="01 /" title="Overview">
          <Copy>
            <p>{project.problem}</p>
            <p><strong>Why it matters.</strong> {project.whyItMatters}</p>
            <p><strong>Workflow.</strong> {project.workflow}</p>
            <p><strong>Outcome.</strong> {project.outcome}</p>
          </Copy>
        </CaseSection>

        <CaseSection id="contribution" number="02 /" title="My contribution">
          <Copy>
            <p>{project.contribution}</p>
            {project.collaborators && <p><strong>Collaborators and attribution.</strong> {project.collaborators}</p>}
            <p><strong>Constraints.</strong></p>
            <EvidenceList items={project.constraints} />
          </Copy>
        </CaseSection>

        <CaseSection id="architecture" number="03 /" title="System architecture">
          <div className="arch" aria-label={`${project.title} system architecture`}>
            {project.architecture.map((node) => <div className="node" key={node}>{node}</div>)}
          </div>
        </CaseSection>

        <CaseSection id="implementation" number="04 /" title="Technical implementation">
          <Copy>
            <p><strong>Primary technologies.</strong> {project.technologies.join(" · ")}</p>
            <EvidenceList items={project.implementation} />
            <p className="case-hard-part"><strong>Hardest engineering problem.</strong> {project.hardPart}</p>
          </Copy>
          <div className="decisions" aria-label="Engineering decisions">
            {project.decisions.map((decision, itemIndex) => <div className="decision" key={decision.title}><span className="technical">0{itemIndex + 1}</span><h3>{decision.title}</h3><p>{decision.body}</p></div>)}
          </div>
        </CaseSection>

        <CaseSection id="testing" number="05 /" title="Testing and validation">
          <EvidenceList items={project.testing} />
        </CaseSection>

        <CaseSection id="results" number="06 /" title="Results and evidence">
          <Copy>
            <p>{project.evidenceScope}</p>
            <EvidenceList items={project.results} />
          </Copy>
          <div className="case-evidence-metrics">
            {project.metrics.length > 0 && <dl className="metric-grid" aria-label={`${project.title} verified facts`}>
              {project.metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}<small>{metric.context}</small></dd></div>)}
            </dl>}
            <ClaimStrip claimIds={project.claimIds} />
          </div>
        </CaseSection>

        {project.media.length > 0 && <div id="gallery"><ProjectGallery media={project.media} projectSlug={project.slug} /></div>}
        {project.demoMode && <ProjectInteractionPanel project={project} />}

        <CaseSection id="limitations" number="07 /" title="Limitations">
          <EvidenceList items={project.limitations} />
        </CaseSection>

        <CaseSection id="next-iteration" number="08 /" title="What I would build next">
          <Copy>
            <p>{project.nextIteration}</p>
            <ul className="limit-list inline-list">{project.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul>
            <div className="case-next-actions actions">
              {isCvProject && project.availability.source === "verified" && project.links.source && <ActionLink href={`/projects/${project.slug}/source`}>Inspect source</ActionLink>}
              {!isCvProject && project.links.source && <ActionLink href={project.links.source} external>Inspect source</ActionLink>}
            </div>
          </Copy>
        </CaseSection>

        <nav className="case-nav" aria-label="Case study navigation">
          <ActionLink href="/projects">Back to selected work</ActionLink>
          {next && <ActionLink href={`/projects/${next.slug}`} primary>Next · {next.title}</ActionLink>}
        </nav>
      </article>
    </main>
  );
}
