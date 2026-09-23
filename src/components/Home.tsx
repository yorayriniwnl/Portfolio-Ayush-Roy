import { ActionLink } from "./ActionLink";
import { ClaimStrip } from "./ClaimStrip";
import { profile } from "@/content/profile";
import { recruiterProjects } from "@/content/project-registry";

export function Home() {
  const verifiedSourceProjects = recruiterProjects.filter(
    (project) => project.availability.source === "verified" && project.links.source,
  );

  return (
    <main id="main" className="hub-page">
      <section className="hub-hero" aria-labelledby="hero-title">
        <div className="hub-hero-grid-lines" aria-hidden="true" />
        <div className="container hub-hero-layout">
          <div className="hub-hero-copy">
            <p className="technical hub-eyebrow"><span className="hub-pulse" /> YOR / PRODUCT ENGINEERING</p>
            <h1 id="hero-title">{profile.name}<br /><em>{profile.headline}.</em></h1>
            <p className="hub-hero-deck">Building realtime systems, interactive interfaces, developer products, and applied ML systems.</p>
            <div className="hub-hero-status"><span className="hub-status-dot" /> <span>{profile.status}</span><i>·</i><span>{profile.location}</span></div>
            <div className="hub-hero-proof-grid" aria-label="Engineering focus">
              <div><span className="technical">01 / REALTIME</span><strong>Postgres · Redis · WebSockets</strong></div>
              <div><span className="technical">02 / APPLIED ML</span><strong>Interpretable feature pipelines</strong></div>
              <div><span className="technical">03 / INTERACTIVE</span><strong>Three.js · WebGPU / WebGL 2</strong></div>
            </div>
            <div className="actions hub-hero-actions">
              <ActionLink href="/projects" primary>Explore work</ActionLink>
              <ActionLink href="/resume">Read resume</ActionLink>
              <ActionLink href={profile.links.github} external>GitHub</ActionLink>
              <ActionLink href={profile.links.linkedin} external>LinkedIn</ActionLink>
            </div>
          </div>

          <div className="hub-orbit-stage" role="img" aria-label="A crimson YOR signal core surrounded by an interactive engineering field">
            <div className="hub-orbit-ambient" aria-hidden="true" />
            <div className="hub-orbit" aria-hidden="true">
              <span className="hub-orbit-ring hub-orbit-ring-one" />
              <span className="hub-orbit-ring hub-orbit-ring-two" />
              <span className="hub-orbit-ring hub-orbit-ring-three" />
              <span className="hub-orbit-satellite hub-orbit-satellite-one">01</span>
              <span className="hub-orbit-satellite hub-orbit-satellite-two">∞</span>
              <div className="hub-orbit-core"><strong>YOR</strong><span>SIGNAL CORE</span></div>
            </div>
            <div className="hub-orbit-label hub-orbit-label-top technical">SIGNAL / 01</div>
            <div className="hub-orbit-label hub-orbit-label-bottom technical">ENGINEERING · EVIDENCE · MOTION</div>
            <div className="hub-orbit-side technical"><span>LIVE INDEX</span><b /><span>EVIDENCE ATTACHED</span></div>
          </div>
        </div>
        <div className="container hub-hero-foot technical"><span>SCROLL TO EXPLORE</span><span>{verifiedSourceProjects.length.toString().padStart(2, "0")} VERIFIED SOURCE LINKS</span><span>{profile.location.toUpperCase()}</span></div>
      </section>

      <section className="hub-proof-strip" aria-labelledby="proof-title">
        <div className="container">
          <div className="hub-proof-strip-heading"><span className="technical">00 / RECEIPTS FIRST</span><h2 id="proof-title">Evidence stays<br /><em>attached.</em></h2><p>Every claim below opens the repository or evaluation boundary that supports it. A status can be useful without pretending to be a deployment.</p></div>
          <ClaimStrip projects={["candidatex", "talks", "ai-vs-real"]} compact />
        </div>
      </section>

      <section id="products" className="hub-section hub-products" aria-labelledby="products-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">01 / PRODUCTS &amp; SYSTEMS</span><h2 id="products-title">Open a door.<br /><em>Inspect the system.</em></h2></div>
            <p>Every project gets a case study for the reasoning and a stable source namespace for the receipt. Deployment claims stay separate from source availability.</p>
          </div>
          <div className="hub-product-grid">
            {recruiterProjects.map((project, index) => {
              const sourceVerified = project.availability.source === "verified" && Boolean(project.links.source);
              return (
                <article key={project.slug} className={`hub-product-card ${index === 0 ? "hub-product-card-featured" : ""}`}>
                  <div className="hub-product-art" style={{ backgroundImage: `url("${project.art}")` }}>
                    <span className="technical hub-product-index">{project.index} / {project.period}</span>
                    <span className="technical hub-product-link-state">{sourceVerified ? "PUBLIC SOURCE / VERIFIED" : "SOURCE / UNAVAILABLE"}</span>
                    <div className="hub-product-art-caption"><span>{project.kicker}</span><span>Evidence labeled</span></div>
                  </div>
                  <div className="hub-product-body">
                    <span className="technical hub-card-kicker">{project.kicker}</span>
                    <h3>{project.title}</h3>
                    <p>{project.purpose}</p>
                    <ul className="hub-tags" aria-label={`${project.title} technologies`}>
                      {project.technologies.slice(0, 4).map((technology) => <li key={technology}>{technology}</li>)}
                    </ul>
                    <div className="hub-product-status"><span>{project.status}</span><span>{project.period}</span></div>
                    <div className="actions hub-card-actions">
                      <ActionLink href={`/projects/${project.slug}`} primary>Case study</ActionLink>
                      {sourceVerified && <ActionLink href={`/projects/${project.slug}/source`}>Source</ActionLink>}
                      {project.availability.live === "verified" && project.links.live && <ActionLink href={`/projects/${project.slug}/live`}>View live</ActionLink>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="engineering" className="hub-section hub-engineering" aria-labelledby="engineering-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">02 / ENGINEERING APPROACH</span><h2 id="engineering-title">Make the<br /><em>reasoning visible.</em></h2></div>
            <p>The visual system is a signature. The engineering story is the proof: frame the failure, choose a boundary, measure what exists, and label what still needs evidence.</p>
          </div>
          <div className="hub-approach-grid">
            <article><span className="technical">01 / FRAME</span><h3>Start with the failure.</h3><p>Each case study names the user problem and the constraint before showing a stack or a scene.</p></article>
            <article><span className="technical">02 / TRACE</span><h3>Keep the path inspectable.</h3><p>Architecture, ownership, data boundaries, and evidence links stay close enough to challenge.</p></article>
            <article><span className="technical">03 / ADJUST</span><h3>Let evidence change the plan.</h3><p>Limitations and next iterations are part of the work, not a footnote added after the visual polish.</p></article>
          </div>
        </div>
      </section>

      <section className="hub-section hub-lab-gateway" aria-labelledby="lab-gateway-title">
        <div className="container hub-lab-gateway-inner">
          <span className="technical hub-section-kicker">03 / YOR LAB</span>
          <h2 id="lab-gateway-title">Experiments belong<br /><em>in their own room.</em></h2>
          <p>Game-room concepts, media experiments, and playful interface studies live outside the recruiter path. They are labeled for what they are: experiments, not finished products.</p>
          <div className="actions"><ActionLink href="/lab" primary>Enter the lab</ActionLink></div>
        </div>
      </section>

      <section id="about" className="hub-section hub-about" aria-labelledby="about-title">
        <div className="container">
          <div className="hub-about-frame">
            <div className="hub-about-intro"><span className="technical hub-section-kicker">04 / ABOUT THE BUILDER</span><h2 id="about-title">A portfolio<br /><em>with a pulse.</em></h2><p>{profile.positioning}</p><div className="actions"><ActionLink href={profile.links.github} external primary>GitHub / source</ActionLink><ActionLink href={profile.links.linkedin} external>LinkedIn</ActionLink></div></div>
            <div className="hub-about-details">
              <div className="hub-detail-block"><span className="technical">FOCUS</span><strong>{profile.headline}</strong><p>Building product systems at the intersection of interfaces, realtime infrastructure, and applied intelligence.</p></div>
              <div className="hub-detail-block"><span className="technical">BASED IN</span><strong>{profile.location}</strong><p>Open to thoughtful collaborations, technical conversations, and the next ambitious build.</p></div>
              <div className="hub-detail-block"><span className="technical">PUBLIC CHANNELS</span><div className="hub-channel-list"><a href={profile.links.github} target="_blank" rel="noopener noreferrer"><span>GitHub</span><span>Source / linked ↗</span></a><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><span>Profile / public ↗</span></a><a href={profile.links.steam} target="_blank" rel="noopener noreferrer"><span>Steam</span><span>Personal / public ↗</span></a></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="hub-contact" aria-labelledby="contact-title">
        <div className="container hub-contact-inner"><span className="technical">05 / OPEN CHANNEL</span><h2 id="contact-title">Have a system<br /><em>worth building?</em></h2><a className="hub-email" href={`mailto:${profile.email}`}>{profile.email}</a><div className="actions"><ActionLink href={`mailto:${profile.email}`} external primary>Start a conversation</ActionLink><ActionLink href="/resume">Resume</ActionLink></div></div>
      </section>

      <footer className="container hub-footer"><span>AYUSH ROY <i>·</i> YOR <i>·</i> 2026</span><span>FIELD HUB / SOURCE-LINKED / EVIDENCE-LABELED</span></footer>
    </main>
  );
}
