import Link from "next/link";
import { profile } from "@/content/profile";
import { recruiterProjects } from "@/content/project-registry";
import { SkillBoard } from "./SkillBoard";

const timeline = [
  { year: "2023–2027", title: "The foundation", category: "Education", description: "B.Tech in Computer Science and Communication Engineering at KIIT. An ongoing practice of building things, taking them apart, and learning how they work." },
  { year: "2026", title: "Systems in the real world", category: "Experience", description: "Telecom and Data Network internship at BSNL, connecting classroom ideas with actual networks and infrastructure." },
  { year: "Now", title: "From prototypes to products", category: "Current chapter", description: "Building full-stack products, exploring machine learning, and turning technical decisions into projects people can investigate." },
];

function HeroIllustration() {
  return (
    <svg className="ref-figure" viewBox="0 0 520 680" role="img" aria-label="Stylized illustrated developer standing beside an interactive workstation" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ref-coat" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#29304a"/><stop offset="1" stopColor="#10162a"/></linearGradient>
        <linearGradient id="ref-shirt" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#faf8f0"/><stop offset="1" stopColor="#d9d9e4"/></linearGradient>
        <linearGradient id="ref-pants" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#1f233b"/><stop offset="1" stopColor="#4d536e"/></linearGradient>
        <linearGradient id="ref-skin" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#d5a17a"/><stop offset="1" stopColor="#9e674e"/></linearGradient>
        <filter id="ref-shadow" x="-25%" y="-25%" width="150%" height="160%"><feGaussianBlur stdDeviation="13"/></filter>
      </defs>
      <ellipse cx="259" cy="649" rx="155" ry="22" fill="#212238" opacity=".11" filter="url(#ref-shadow)"/>
      <path d="M174 352Q163 398 183 481L176 629Q200 647 229 636L266 474 292 640Q323 649 348 631L343 446 330 347Z" fill="url(#ref-pants)"/>
      <path d="M176 616Q202 611 229 627L230 649Q195 663 158 654L154 644Z" fill="#1c1c2e"/>
      <path d="M297 628Q320 617 346 621L366 648Q360 666 322 659L300 653Z" fill="#1c1c2e"/>
      <path d="M231 210Q254 199 277 213L284 255 226 255Z" fill="url(#ref-skin)"/>
      <path d="M194 247Q226 220 255 226L297 226Q340 249 345 294L337 400 182 400 170 304Q170 270 194 247Z" fill="url(#ref-shirt)"/>
      <path d="M200 238L239 235 222 402 173 410Q172 335 166 301Q171 255 200 238Z" fill="url(#ref-coat)"/>
      <path d="M293 233Q335 247 347 290L356 395 301 407 279 237Z" fill="url(#ref-coat)"/>
      <path d="M242 234L258 247 273 234 260 307Z" fill="#e9c9a6"/>
      <path d="M243 246L260 258 249 360 241 387 235 357Z" fill="#434462"/>
      <path d="M190 269Q167 290 164 335L160 407 182 416Q205 377 209 328Z" fill="url(#ref-coat)"/>
      <path d="M329 275Q360 280 381 335L411 382 385 402 345 365 325 324Z" fill="url(#ref-coat)"/>
      <path d="M385 386Q391 376 397 375L408 382 415 398Q411 412 400 416L387 405Z" fill="url(#ref-skin)"/>
      <path d="M161 396Q151 393 148 405L147 437Q149 451 159 454L170 445 181 407Z" fill="url(#ref-skin)"/>
      <ellipse cx="258" cy="173" rx="58" ry="74" fill="url(#ref-skin)"/>
      <path d="M200 175Q192 118 229 96 274 70 302 108 326 139 309 187L291 166 284 122Q264 140 224 137L210 183Z" fill="#202033"/>
      <path d="M205 175Q190 216 218 243L214 209Z" fill="#202033"/>
      <path d="M307 167Q325 214 292 245L302 203Z" fill="#202033"/>
      <path d="M229 177Q237 172 245 178M270 177Q278 173 286 178" fill="none" stroke="#382922" strokeWidth="3" strokeLinecap="round"/>
      <path d="M248 207Q260 212 272 204" fill="none" stroke="#794f43" strokeWidth="3" strokeLinecap="round"/>
      <path d="M231 265L226 382" stroke="#6a6c83" strokeWidth="1.8" opacity=".65"/>
      <path d="M295 261L301 391" stroke="#83829a" strokeWidth="1.8" opacity=".65"/>
      <path d="M180 404Q261 424 338 399L339 411Q271 440 175 416Z" fill="#15182b" opacity=".85"/>
      <circle cx="258" cy="412" r="8" fill="#d4b78b"/>
      <path d="M175 287Q181 314 188 335M333 283Q330 314 331 333" stroke="#75778d" strokeWidth="2" opacity=".45" fill="none"/>
    </svg>
  );
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}

export function EditorialHome() {
  return (
    <main id="main" className="ref-home">
      <section className="ref-hero" aria-labelledby="ref-hero-title" data-experience-section="identity">
        <div className="ref-shell ref-hero-layout">
          <div className="ref-hero-track">
            <div className="ref-eyebrow"><span className="ref-flower" aria-hidden="true">✳</span> PORTFOLIO / EST. 2026 <span className="ref-hero-line"/></div>
            <p className="ref-handwriting">Hello there! I&apos;m Ayush <span aria-hidden="true">↗</span></p>
            <h1 id="ref-hero-title" className="ref-hero-title" data-essential-copy>Full Stack<br /><em>Developer.</em></h1>
            <p className="ref-hero-intro" data-essential-copy>Building thoughtful digital experiences, from powerful backends to the little details that make products feel human.</p>
            <div className="ref-hero-actions">
              <a href="#projects" className="ref-button ref-button-primary">Explore my work <Arrow diagonal /></a>
              <Link href="/resume" className="ref-button ref-button-secondary">View résumé <Arrow diagonal /></Link>
            </div>
            <div className="ref-hero-bottom"><span className="ref-availability"><i/> Open to software engineering opportunities</span><span>SCROLL TO EXPLORE ↓</span></div>
          </div>
          <div className="ref-hero-visual" aria-label="Illustrated portfolio hero">
            <div className="ref-background-type" aria-hidden="true">YOR</div>
            <div className="ref-outline-orbit ref-orbit-one" aria-hidden="true"/>
            <div className="ref-outline-orbit ref-orbit-two" aria-hidden="true"/>
            <div className="ref-hero-sun" aria-hidden="true">✺</div>
            <div className="ref-figure-stage"><HeroIllustration /></div>
            <div className="ref-float-note ref-float-note-top"><span className="ref-mono">01 / WHAT I DO</span><strong>Design-minded<br/>Engineering</strong><span className="ref-note-mark">✦</span></div>
            <div className="ref-float-note ref-float-note-bottom"><span className="ref-mono">HELLO WORLD_</span><span>Made with curiosity<br/>&amp; a lot of coffee.</span><span className="ref-note-arrow" aria-hidden="true">↗</span></div>
            <div className="ref-vertical-caption" aria-hidden="true">YOR / NOT YOUR AVERAGE PORTFOLIO</div>
          </div>
        </div>
        <div className="ref-hero-marquee" aria-hidden="true"><span>IDEATE ✳ BUILD ✳ ITERATE ✳ SHIP ✳ EXPLORE ✳ REPEAT ✳ </span><span>IDEATE ✳ BUILD ✳ ITERATE ✳ SHIP ✳ EXPLORE ✳ REPEAT ✳ </span></div>
      </section>

      <section id="about" className="ref-section ref-about" aria-labelledby="ref-about-title" data-experience-section="about">
        <div className="ref-shell ref-about-grid">
          <div className="ref-section-lead"><span className="ref-section-index">01 / ABOUT ME</span><span className="ref-squiggle" aria-hidden="true">✳</span><h2 id="ref-about-title">Hi, I&apos;m<br/><em>Ayush.</em></h2><p>Developer by trade. Explorer by nature.</p><Link href="/resume" className="ref-text-link">A little more about me <Arrow diagonal /></Link></div>
          <div className="ref-about-copy"><div className="ref-photo-label"><span>AYUSH ROY</span><span>BEHIND THE SCREEN ↗</span></div><div className="ref-about-card"><div className="ref-about-avatar" aria-hidden="true">AR<span>✳</span></div><div><span className="ref-mono">THE SHORT VERSION</span><h3>I make ideas work.</h3><p>I&apos;m a full-stack software engineer who enjoys building reliable systems, expressive interfaces, and things people can actually use. I work with Python, TypeScript, databases, real-time apps, and applied AI.</p><p>Some days it&apos;s an API. Some days it&apos;s an entire digital world. The curiosity stays the same.</p><div className="ref-about-chips"><span>BASED IN INDIA</span><span>BUILDER AT HEART</span><span>ALWAYS LEARNING</span></div></div></div></div>
        </div>
      </section>

      <section id="skills" className="ref-section ref-skills" aria-labelledby="ref-skills-title">
        <div className="ref-shell"><div className="ref-section-head"><div><span className="ref-section-index">02 / THE TOOLBOX</span><h2 id="ref-skills-title">Things I <em>work with.</em></h2></div><p>Languages, frameworks, and tools that help me turn rough sketches into working systems. Select a tile to find out where it fits.</p></div><SkillBoard /></div>
      </section>

      <section id="projects" className="ref-section ref-projects" aria-labelledby="ref-projects-title" data-experience-section="projects">
        <div className="ref-shell"><div className="ref-section-head"><div><span className="ref-section-index">03 / SELECTED WORK</span><h2 id="ref-projects-title">Things I&apos;ve <em>built.</em></h2></div><p>Not just a collection of screenshots. Six engineering stories, with the thinking and the work behind them.</p></div>
          <div className="ref-project-list">
            {recruiterProjects.map((project, index) => (
              <article className="ref-project" key={project.slug} data-project-slug={project.slug}>
                <Link className="ref-project-visual" href={"/projects/" + project.slug} aria-label={"Explore " + project.title}>
                  <span className="ref-project-graphic" style={{ backgroundImage: "url(" + project.art + ")" }} aria-hidden="true"/>
                  <span className="ref-project-stamp">{String(index + 1).padStart(2, "0")} / 06</span>
                  <span className="ref-project-visual-arrow" aria-hidden="true">↗</span>
                </Link>
                <div className="ref-project-info"><div className="ref-project-top"><span className="ref-mono">{project.period}</span><span className="ref-mono">{project.status}</span></div><h3><Link href={"/projects/" + project.slug}>{project.title}</Link></h3><p>{project.purpose}</p><div className="ref-project-footer"><span>{project.technologies.slice(0, 3).join(" · ")}</span><Link href={"/projects/" + project.slug}>Case study <Arrow diagonal /></Link></div></div>
              </article>
            ))}
          </div>
          <div className="ref-project-outro"><span>Curious about the process behind the pixels?</span><Link href="/projects" className="ref-button ref-button-secondary">View all project details <Arrow diagonal /></Link></div>
        </div>
      </section>

      <section className="ref-section ref-journey" aria-labelledby="ref-journey-title">
        <div className="ref-shell"><div className="ref-section-head"><div><span className="ref-section-index">04 / MY JOURNEY</span><h2 id="ref-journey-title">Always <em>learning.</em></h2></div><p>A few chapters in a story that is still being written.</p></div><div className="ref-timeline">{timeline.map((chapter, index) => <article className="ref-timeline-entry" key={chapter.year}><span className="ref-timeline-number">{String(index + 1).padStart(2, "0")}</span><span className="ref-mono">{chapter.year}</span><div><span className="ref-mono">{chapter.category}</span><h3>{chapter.title}</h3><p>{chapter.description}</p></div><span className="ref-timeline-star" aria-hidden="true">✳</span></article>)}</div></div>
      </section>

      <section className="ref-section ref-moments" aria-labelledby="ref-moments-title"><div className="ref-shell"><span className="ref-section-index">05 / LITTLE BIG THINGS</span><h2 id="ref-moments-title">Proud <em>moments.</em></h2><div className="ref-moment-grid"><div className="ref-moment-card ref-moment-card-dark"><span>01 / RESEARCH</span><strong>Questions worth<br/>investigating.</strong><p>Building CandidateX and exploring evidence-first technical assessment.</p><Link href="/projects/candidatex">Explore research ↗</Link></div><div className="ref-moment-card ref-moment-card-cream"><span>02 / MAKING</span><strong>Projects that<br/>actually run.</strong><p>From full-stack product systems to interactive prototypes and experiments.</p><Link href="/projects">See the builds ↗</Link></div><div className="ref-moment-card ref-moment-card-lilac"><span>03 / CURIOSITY</span><strong>A little room<br/>to play.</strong><p>Side experiments, creative code, and whatever idea comes next.</p><Link href="/lab">Visit the lab ↗</Link></div></div></div></section>

      <section id="contact" className="ref-section ref-contact" aria-labelledby="ref-contact-title" data-experience-section="contact"><div className="ref-shell"><span className="ref-section-index">06 / SAY HELLO</span><div className="ref-contact-grid"><h2 id="ref-contact-title">Let&apos;s build<br/><em>something good.</em></h2><div><p>Have an interesting problem, a role to discuss, or simply a thought to share? My inbox is open.</p><a className="ref-button ref-button-primary" href={"mailto:" + profile.email}>Drop me a message <Arrow diagonal /></a><div className="ref-contact-links"><a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><Link href="/resume">Résumé ↗</Link></div></div></div><footer className="ref-footer"><span>© 2026 AYUSH ROY · YOR</span><span>MADE WITH CURIOSITY ✳</span><a href="#main">BACK TO TOP ↑</a></footer></div></section>
    </main>
  );
}
