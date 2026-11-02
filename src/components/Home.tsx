import Link from "next/link";
import { coreStack, homeHighlights } from "@/content/home";
import { profile } from "@/content/profile";
import { YorArtifact } from "./YorArtifact";

const disciplines = [
  { number: "01", title: "Product engineering", detail: "Interfaces, APIs and the systems that make the experience dependable.", code: "BUILD / SHIP" },
  { number: "02", title: "Realtime architecture", detail: "State, events, persistence and the invisible decisions behind responsive software.", code: "DESIGN / CONNECT" },
  { number: "03", title: "Evidence-led research", detail: "Applied ML, careful measurement and conclusions that acknowledge their limits.", code: "QUESTION / TEST" },
  { number: "04", title: "Security & reliability", detail: "Privacy boundaries, failure cases and engineering that can be inspected.", code: "PROTECT / VERIFY" },
] as const;

/** Server-rendered editorial content. The small interactive instrument is a
 * self-contained client island; project facts remain sourced from the registry. */
export function Home() {
  return (
    <main id="main" className="home">
      <section className="home-hero" aria-labelledby="home-title" data-experience-section="identity">
        <div className="home-wrap">
          <div className="home-hero__eyebrow"><span className="home-live-dot" aria-hidden="true" /> <span>YOR / INDEPENDENT ENGINEER</span><span className="home-hero__edition">PORTFOLIO · 2026</span></div>
          <div className="home-hero__grid">
            <div className="home-hero__intro">
              <p className="home-overline">I&apos;m Ayush Roy. I build things with intention.</p>
              <h1 id="home-title" data-essential-copy>Code with<br /><em>character.</em></h1>
              <p className="home-hero__lede" data-essential-copy>
                Full-stack products, realtime systems and applied machine learning.
                Drawn to ambitious ideas. Obsessed with the details that make them work.
              </p>
              <div className="home-hero__actions">
                <a className="home-button home-button--primary" href="#projects">Explore the work <span aria-hidden="true">↗</span></a>
                <Link className="home-button home-button--quiet" href="/resume">View résumé <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="home-hero__signal"><span className="home-hero__signal-mark">↳</span><span>From an idea to a working system.<br />From a system to something worth remembering.</span></div>
            </div>
            <YorArtifact />
          </div>
          <div className="home-hero__bottom" aria-label="At a glance">
            <span><b>01 /</b> {profile.status}</span>
            <span><b>02 /</b> B.Tech CSCE · KIIT · 2027</span>
            <a href="#projects"><b>SCROLL TO EXPLORE</b><span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>

      <section id="projects" className="home-work" aria-labelledby="work-title" data-experience-section="projects">
        <div className="home-wrap">
          <header className="home-section-head">
            <div><p className="home-kicker">01 / SELECTED WORK</p><h2 id="work-title">Ideas made<br /><em>tangible.</em></h2></div>
            <div className="home-section-head__aside"><p>Not just the finished screens. The decisions, trade-offs and evidence behind them.</p><Link className="home-text-link" href="/projects">All six case studies <span aria-hidden="true">↗</span></Link></div>
          </header>
          <ol className="home-work__list">
            {homeHighlights.map(({ project, metric, caption, source, live }, index) => (
              <li key={project.slug}>
                <article className="home-project" aria-labelledby={`home-project-${project.slug}`}>
                  <div className="home-project__visual" style={{ backgroundImage: `url("${project.art}")` }}>
                    <span className="home-project__visual-top"><span>YOR / FIELD NOTES</span><span>NO. {String(index + 1).padStart(2, "0")}</span></span>
                    <span className="home-project__art-title" aria-hidden="true">{project.title}</span>
                    <span className="home-project__visual-bottom">PROJECT ARTWORK <span aria-hidden="true">↗</span></span>
                  </div>
                  <div className="home-project__main">
                    <div className="home-project__meta"><span>0{index + 1} / {project.kicker}</span><span>{project.status}</span></div>
                    <h3 id={`home-project-${project.slug}`}><Link href={`/projects/${project.slug}`}>{project.title}<span aria-hidden="true">↗</span></Link></h3>
                    <p className="home-project__purpose">{project.purpose}</p>
                    <div className="home-project__metric"><span className="home-project__metric-label">{metric.label} / REPORTED EVIDENCE</span><strong>{metric.value}</strong><span>{caption}</span></div>
                    <ul className="home-project__stack" aria-label={`${project.title} technologies`}>
                      {project.technologies.slice(0, 5).map((technology) => <li key={technology}>{technology}</li>)}
                    </ul>
                    <div className="home-project__links">
                      <Link href={`/projects/${project.slug}`}>Explore case study <span aria-hidden="true">↗</span></Link>
                      {source && <Link href={source}>Source code <span aria-hidden="true">↗</span></Link>}
                      {live && <Link href={live}>Live demo <span aria-hidden="true">↗</span></Link>}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
          <div className="home-work__tail"><span>THERE IS MORE BELOW THE SURFACE.</span><Link className="home-text-link" href="/projects">Explore the complete archive <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section className="home-method" aria-labelledby="method-title" data-experience-section="projects">
        <div className="home-wrap">
          <div className="home-method__top"><p className="home-kicker">02 / THE PRACTICE</p><h2 id="method-title">The craft is in<br /><em>the connections.</em></h2><p>Good engineering is more than choosing the right stack. It is knowing what matters, what can fail, and what should stay simple.</p></div>
          <div className="home-method__grid">
            {disciplines.map((discipline) => <article key={discipline.number} className="home-discipline">
              <span className="home-discipline__index">{discipline.number} <span aria-hidden="true">✳</span></span>
              <h3>{discipline.title}</h3><p>{discipline.detail}</p><span className="home-discipline__code">{discipline.code}</span>
            </article>)}
          </div>
          <div className="home-method__foot"><span>TOOLS CHANGE. THE THINKING ENDURES.</span><p>{coreStack.join(" · ")}</p></div>
        </div>
      </section>

      <section id="about" className="home-about" aria-labelledby="about-title" data-experience-section="about">
        <div className="home-wrap home-about__grid">
          <div><p className="home-kicker">03 / THE PERSON BEHIND THE CODE</p><h2 id="about-title">Curious by<br /><em>design.</em></h2><div className="home-about__monogram" aria-hidden="true">Y<span>O</span>R<span className="home-about__orbit">✳</span></div></div>
          <div className="home-about__body">
            <p className="home-about__statement">I care about how software <em>feels</em> as much as how it works.</p>
            <p>I&apos;m an engineer studying Computer Science and Communication Engineering at KIIT, with a focus on backend architecture, full-stack products and evidence-grounded research.</p>
            <p>I like untangling complicated systems and turning the results into experiences people actually want to use. Away from conventional product work, I experiment with interactive scenes and visual storytelling.</p>
            <dl className="home-about__facts">
              <div><dt>Currently</dt><dd>{profile.status}</dd></div>
              <div><dt>Education</dt><dd>{profile.education}</dd></div>
              <div><dt>Location</dt><dd>{profile.location}</dd></div>
            </dl>
            <Link className="home-text-link" href="/lab#studio">Visit the Lab <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section id="contact" className="home-contact" aria-labelledby="contact-title" data-experience-section="contact">
        <div className="home-wrap">
          <div className="home-contact__heading"><p className="home-kicker">04 / THE NEXT CHAPTER</p><span className="home-contact__asterisk" aria-hidden="true">✳</span></div>
          <h2 id="contact-title">Have something<br /><em>worth building?</em></h2>
          <p>Interesting problem, ambitious product, engineering opportunity or simply a good conversation? I&apos;m listening.</p>
          <a className="home-contact__email" href={`mailto:${profile.email}`}>{profile.email}<span aria-hidden="true">↗</span></a>
          <div className="home-contact__links" aria-label="Profiles">
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <Link href="/resume">Résumé ↗</Link>
          </div>
        </div>
        <footer className="home-wrap home-footer"><span>© 2026 AYUSH ROY / YOR</span><span>DESIGNED WITH CURIOSITY. BUILT WITH CARE.</span><a href="#main">Back to top ↑</a></footer>
      </section>
    </main>
  );
}
