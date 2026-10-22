import Link from "next/link";
import { coreStack, homeHighlights } from "@/content/home";
import { profile } from "@/content/profile";

/**
 * Recruiter-first homepage, fully server-rendered: who Ayush is, three
 * projects with checkable results, a short biography, and how to get in touch.
 * The interactive 3D studio lives in the Lab.
 */
export function Home() {
  return (
    <main id="main" className="home">
      <section className="home-hero" aria-labelledby="home-title" data-experience-section="identity">
        <div className="home-wrap home-hero__grid">
          <div className="home-hero__intro">
            <h1 id="home-title" data-essential-copy>
              Building software<br />
              <em>that works.</em>
            </h1>
            <p className="home-hero__lede" data-essential-copy>
              I&apos;m Ayush Roy. I design and build full-stack products, real-time systems,
              and applied machine-learning tools, and I document each one with its source
              code and the technical decisions behind it.
            </p>
            <div className="home-hero__actions">
              <a className="home-button home-button--primary" href="#projects">Explore selected work</a>
              <Link className="home-button" href="/resume">View résumé</Link>
            </div>
          </div>
          <dl className="home-facts" aria-label="At a glance">
            <div><dt>Status</dt><dd>{profile.status}</dd></div>
            <div><dt>Education</dt><dd>{profile.education}</dd></div>
            <div><dt>Based in</dt><dd>{profile.location}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
          </dl>
        </div>
      </section>

      <section id="projects" className="home-work" aria-labelledby="work-title" data-experience-section="projects">
        <div className="home-wrap">
          <header className="home-section-head">
            <h2 id="work-title">Selected work</h2>
            <p>Three projects with numbers you can check. Each case study shows my contribution, the evidence, and its limits.</p>
            <Link className="home-text-link" href="/projects">All six case studies</Link>
          </header>
          <ul className="home-work__list">
            {homeHighlights.map(({ project, metric, caption, source, live }) => (
              <li key={project.slug}>
                <article className="home-project" aria-labelledby={`home-project-${project.slug}`}>
                  <div className="home-project__main">
                    <p className="home-project__kicker">{project.kicker}</p>
                    <h3 id={`home-project-${project.slug}`}>
                      <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                    </h3>
                    <p className="home-project__purpose">{project.purpose}</p>
                    <ul className="home-project__stack" aria-label={`${project.title} technologies`}>
                      {project.technologies.slice(0, 5).map((technology) => <li key={technology}>{technology}</li>)}
                    </ul>
                  </div>
                  <div className="home-project__evidence">
                    <p className="home-project__metric">
                      <strong>{metric.value}</strong>
                      <span>{caption}</span>
                    </p>
                    <div className="home-project__links">
                      <Link href={`/projects/${project.slug}`}>Read the case study</Link>
                      {source && <Link href={source}>Source code <span aria-hidden="true">↗</span></Link>}
                      {live && <Link href={live}>Live demo <span aria-hidden="true">↗</span></Link>}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="about" className="home-about" aria-labelledby="about-title" data-experience-section="about">
        <div className="home-wrap home-about__grid">
          <h2 id="about-title">About</h2>
          <div className="home-about__body">
            <p>I&apos;m a software engineer who enjoys the interesting part of building: making tricky systems understandable, useful and a little delightful.</p>
            <p>From evidence-first assessment tools and real-time social platforms to energy dashboards, I like getting into the details without losing sight of the people who use the product.</p>
            <p className="home-about__stack"><span>Core stack</span>{coreStack.join(", ")}</p>
            <p className="home-about__lab">Off the clock I build experiments, including an interactive 3D studio you can walk through. <Link className="home-text-link" href="/lab#studio">Visit the Lab</Link></p>
          </div>
        </div>
      </section>

      <section id="contact" className="home-contact" aria-labelledby="contact-title" data-experience-section="contact">
        <div className="home-wrap">
          <h2 id="contact-title">Let&apos;s make something happen.</h2>
          <p>Have a role, an idea or a good question? Email is the fastest way to reach me.</p>
          <a className="home-contact__email" href={`mailto:${profile.email}`}>{profile.email}</a>
          <ul className="home-contact__links" aria-label="Profiles">
            <li><a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></li>
            <li><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></li>
            <li><Link href="/resume">Résumé</Link></li>
          </ul>
        </div>
        <footer className="home-wrap home-footer">
          <span>© 2026 Ayush Roy</span>
          <a href="#main">Back to top</a>
        </footer>
      </section>
    </main>
  );
}
