import Link from "next/link";
import { profile } from "@/content/profile";
import { recruiterProjects } from "@/content/project-registry";
import { EditorialSkills, EditorialWork } from "./EditorialInteractive";

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

function EditorialPortrait() {
  return (
    <div className="editorial-portrait" aria-label="Illustrated engineer portrait">
      <div className="editorial-portrait__halo" />
      <svg viewBox="0 0 520 680" role="img" aria-label="Stylized illustrated portrait with dark hair and a light shirt">
        <defs>
          <linearGradient id="editorial-shirt" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#faf9f4" /><stop offset="1" stopColor="#d7d5c7" />
          </linearGradient>
          <linearGradient id="editorial-pants" x1="0" x2="1">
            <stop stopColor="#262a33" /><stop offset="1" stopColor="#12141b" />
          </linearGradient>
          <linearGradient id="editorial-face" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#c99876" /><stop offset=".65" stopColor="#ad7657" /><stop offset="1" stopColor="#86583f" />
          </linearGradient>
          <filter id="editorial-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>
        <ellipse cx="266" cy="648" rx="161" ry="18" fill="#66645f" opacity=".18" filter="url(#editorial-shadow)" />
        <path d="M184 377C170 444 158 541 159 668h95l32-200 27 200h100c-8-156-29-250-55-292Z" fill="url(#editorial-pants)" />
        <path d="M252 420h33l-8 248h-36ZM327 423l16 245h-15l-26-221Z" fill="#343846" opacity=".65" />
        <path d="M210 285c-52 12-73 46-82 89l-30 168 43 10 49-140 2 72c40 27 130 30 171 2l-4-76 47 144 43-12-27-165c-10-47-39-74-93-91Z" fill="url(#editorial-shirt)" stroke="#c3c1b6" strokeWidth="3" />
        <path d="M210 285c25 40 91 48 123 0l-22-23-72-1Z" fill="#ebe8dc" />
        <path d="M235 243v48c13 23 54 27 72 1v-47Z" fill="url(#editorial-face)" />
        <path d="M222 160c-2-55 17-92 74-92 62 0 84 58 63 107-8 18-14 39-20 57-10 32-40 51-65 43-36-11-54-58-52-115Z" fill="url(#editorial-face)" />
        <path d="M220 198c-33-67-19-140 42-154 57-19 111 19 115 75 2 25-3 46-16 66l-11-49c-25-2-45-16-63-34-21 26-42 39-64 40Z" fill="#242229" />
        <path d="M230 128c11-60 83-95 126-46-39-14-69 11-93 34Z" fill="#343039" />
        <path d="M246 169q13-8 27 0M307 169q13-7 25 0" fill="none" stroke="#48332c" strokeWidth="4" strokeLinecap="round" />
        <circle cx="262" cy="174" r="3.6" fill="#232024"/><circle cx="316" cy="174" r="3.6" fill="#232024"/>
        <path d="M289 180l-7 26 10 4M268 232q20 11 38-2" stroke="#754538" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M176 454l-15 71-25 23-5-43 26-76M386 454l21 75 28 21-5-48-28-74" fill="url(#editorial-face)" />
        <path d="M223 306q36 30 61 32 30-6 59-35M189 404q-7 37 3 80M361 405q-2 41 2 79" stroke="#bcb7a7" strokeWidth="3" fill="none"/>
        <path d="M278 338v147" stroke="#c3bfaf" strokeWidth="2"/><circle cx="285" cy="385" r="3" fill="#a8a394"/><circle cx="285" cy="425" r="3" fill="#a8a394"/>
      </svg>
      <span className="editorial-portrait__stamp">FIG. 01 / HUMAN, NOT A TEMPLATE</span>
    </div>
  );
}

export function EditorialHome() {
  return (
    <main id="main" className="editorial-home">
      <section className="editorial-hero editorial-wrap" aria-labelledby="editorial-title" data-experience-section="identity">
        <div className="editorial-hero__ghost" aria-hidden="true">AYUSH</div>
        <div className="editorial-hero__topline"><span>PORTFOLIO / 2026</span><span className="editorial-availability"><span /> OPEN TO SOFTWARE ENGINEERING ROLES</span></div>
        <div className="editorial-hero__layout">
          <div className="editorial-hero__copy">
            <p className="editorial-overline">HELLO, I'M AYUSH ROY. I MAKE THINGS WORK.</p>
            <h1 id="editorial-title" data-essential-copy>Full Stack<br /><em>Developer.</em></h1>
            <p className="editorial-hero__lede" data-essential-copy>Backend-first thinking. Frontend with feeling. I build ambitious software and turn complicated ideas into things people enjoy using.</p>
            <div className="editorial-hero__actions">
              <a className="editorial-pill editorial-pill--dark" href="#projects">Explore my work <span aria-hidden="true">↗</span></a>
              <Link className="editorial-text-link" href="/resume">View résumé <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <EditorialPortrait />
        </div>
        <div className="editorial-hero__footer"><span>BASED IN BHUBANESWAR, INDIA</span><a href="#about">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a><span>© YOR / AYUSH ROY</span></div>
      </section>

      <section id="about" className="editorial-about editorial-section editorial-wrap" aria-labelledby="editorial-about-title" data-experience-section="about">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 01 / GET TO KNOW ME</div>
        <div className="editorial-about__grid">
          <h2 id="editorial-about-title" data-essential-copy>Hi, I'm <em>Ayush.</em></h2>
          <div className="editorial-about__body">
            <p>I&apos;m a software engineer who enjoys the interesting part of building: making tricky systems understandable, useful and a little delightful.</p>
            <p>From evidence-first assessment tools and real-time social platforms to energy dashboards, I like getting into the details without losing sight of the people who use the product.</p>
            <div className="editorial-about__actions"><a href="mailto:ayushroy.dev@gmail.com" className="editorial-pill editorial-pill--dark">Let&apos;s talk <span aria-hidden="true">↗</span></a><Link href="/projects">View all case studies →</Link></div>
          </div>
          <div className="editorial-about__note"><span>MY APPROACH</span><strong>Curious by default.<br/>Rigorous by design.</strong><span>BUILD / TEST / REFINE / REPEAT</span></div>
        </div>
      </section>

      <EditorialSkills />
      <EditorialWork projects={portfolioCards} />

      <section id="experience" className="editorial-experience editorial-section editorial-wrap" aria-labelledby="editorial-experience-title">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 04 / THE JOURNEY</div>
        <h2 id="editorial-experience-title" data-essential-copy>Always <em>learning.</em></h2>
        <div className="editorial-experience__timeline">
          <article><span className="editorial-year">2023</span><div><span className="editorial-timeline__tag">THE FOUNDATION</span><h3>Started engineering.</h3><p>Computer Science and Communication Engineering at KIIT. A steady obsession with how software works.</p></div></article>
          <article><span className="editorial-year">2026</span><div><span className="editorial-timeline__tag">BUILDING IN PUBLIC</span><h3>From experiments to systems.</h3><p>Worked on backend services, full-stack products, applied ML and interactive experiences, with source-backed case studies.</p></div></article>
          <article><span className="editorial-year">2027</span><div><span className="editorial-timeline__tag">WHAT'S NEXT</span><h3>Graduate. Keep building.</h3><p>Expected graduation. Looking for meaningful software engineering challenges and teammates who care about craft.</p></div></article>
        </div>
      </section>

      <section id="moments" className="editorial-moments editorial-section editorial-wrap" aria-labelledby="editorial-moments-title">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 05 / AT A GLANCE</div>
        <h2 id="editorial-moments-title" data-essential-copy>Proud <em>moments.</em></h2>
        <div className="editorial-moments__grid">
          <div><strong>06<span>↗</span></strong><p>documented projects</p></div>
          <div><strong>03<span>+</span></strong><p>engineering disciplines</p></div>
          <div><strong>2027<span>↗</span></strong><p>expected graduation</p></div>
        </div>
      </section>

      <section id="contact" className="editorial-contact editorial-section editorial-wrap" aria-labelledby="editorial-contact-title" data-experience-section="contact">
        <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 06 / SAY HELLO</div>
        <div className="editorial-contact__inner"><div><p>Have an idea, a role or a good question?</p><h2 id="editorial-contact-title" data-essential-copy>Let's make<br /><em>something happen.</em></h2></div><a className="editorial-contact__arrow" href={`mailto:${profile.email}`} aria-label="Email Ayush Roy">↗</a></div>
        <div className="editorial-contact__footer"><a href={`mailto:${profile.email}`}>{profile.email}</a><div><a href={profile.links.github} target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><Link href="/resume">RÉSUMÉ ↗</Link></div><span>© 2026 AYUSH ROY</span></div>
      </section>
    </main>
  );
}
