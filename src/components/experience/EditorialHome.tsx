import Link from "next/link";
import { profile } from "@/content/profile";
import { recruiterProjects } from "@/content/project-registry";
import { EditorialSkills, EditorialWork } from "./EditorialInteractive";
import { StudioHero } from "./StudioHero";

const portfolioCards = recruiterProjects.map((project) => ({
  slug: project.slug,
  title: project.title,
  kicker: project.kicker,
  period: project.period,
  purpose: project.purpose,
  outcome: project.outcome,
  technologies: [...project.technologies.slice(0, 4)],
  art: project.art,
  live: project.availability.live === "verified" ? `/projects/${project.slug}/live` : null,
  source: project.availability.source === "verified" ? `/projects/${project.slug}/source` : null,
}));

export function EditorialHome() {
  return (
    <main id="main" className="editorial-home">
      <StudioHero />
      <EditorialWork projects={portfolioCards} />

      <section id="about" className="editorial-about editorial-section editorial-wrap" aria-labelledby="editorial-about-title" data-experience-section="about">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 02 / THE PERSON</div>
        <div className="editorial-about__grid">
          <h2 id="editorial-about-title" data-essential-copy>Hi, I&apos;m <em>Ayush.</em></h2>
          <div className="editorial-about__body">
            <p>I&apos;m a software engineer who enjoys the interesting part of building: making tricky systems understandable, useful and a little delightful.</p>
            <p>From evidence-first assessment tools and real-time social platforms to energy dashboards, I like getting into the details without losing sight of the people who use the product.</p>
            <div className="editorial-about__actions"><a href={`mailto:${profile.email}` } className="editorial-pill editorial-pill--dark">Let&apos;s talk <span aria-hidden="true">↗</span></a><Link href="/projects">View all case studies →</Link></div>
          </div>
          <div className="editorial-about__note"><span>MY APPROACH</span><strong>Curious by default.<br/>Rigorous by design.</strong><span>BUILD / TEST / REFINE / REPEAT</span></div>
        </div>
      </section>

      <EditorialSkills />

      <section id="experience" className="editorial-experience editorial-section editorial-wrap" aria-labelledby="editorial-experience-title">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 04 / THE JOURNEY</div>
        <h2 id="editorial-experience-title" data-essential-copy>Always <em>learning.</em></h2>
        <div className="editorial-experience__timeline">
          <article><span className="editorial-year">2023</span><div><span className="editorial-timeline__tag">THE FOUNDATION</span><h3>Started engineering.</h3><p>Computer Science and Communication Engineering at KIIT. A steady obsession with how software works.</p></div></article>
          <article><span className="editorial-year">2026</span><div><span className="editorial-timeline__tag">BUILDING IN PUBLIC</span><h3>From experiments to systems.</h3><p>Worked on backend services, full-stack products, applied ML and interactive experiences, with source-backed case studies.</p></div></article>
          <article><span className="editorial-year">2027</span><div><span className="editorial-timeline__tag">WHAT&apos;S NEXT</span><h3>Graduate. Keep building.</h3><p>Expected graduation. Looking for meaningful software engineering challenges and teammates who care about craft.</p></div></article>
        </div>
      </section>

      <section id="moments" className="editorial-moments editorial-section editorial-wrap" aria-labelledby="editorial-moments-title">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 05 / PROOF, NOT PROMISES</div>
        <h2 id="editorial-moments-title" data-essential-copy>Evidence <em>in context.</em></h2>
        <div className="editorial-moments__grid">
          <div><Link href="/projects"><strong>{String(recruiterProjects.length).padStart(2, "0")}<span>↗</span></strong><p>source-backed engineering case studies</p></Link></div>
          <div><Link href="/projects/candidatex"><strong>12<span>↗</span></strong><p>technical capability dimensions in CandidateX</p></Link></div>
          <div><Link href="/projects/ai-vs-real"><strong>107<span>↗</span></strong><p>images in the AI-forensics evaluation holdout</p></Link></div>
        </div>
      </section>

      <section id="contact" className="editorial-contact editorial-section editorial-wrap" aria-labelledby="editorial-contact-title" data-experience-section="contact">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 06 / SAY HELLO</div>
        <div className="editorial-contact__inner"><div><p>Have an idea, a role or a good question?</p><h2 id="editorial-contact-title" data-essential-copy>Let&apos;s make<br /><em>something happen.</em></h2></div><a className="editorial-contact__arrow" href={`mailto:${profile.email}`} aria-label="Email Ayush Roy">↗</a></div>
        <div className="editorial-contact__footer"><a href={`mailto:${profile.email}`}>{profile.email}</a><div><a href={profile.links.github} target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><Link href="/resume">RÉSUMÉ ↗</Link></div><span>© 2026 AYUSH ROY</span></div>
      </section>
    </main>
  );
}
