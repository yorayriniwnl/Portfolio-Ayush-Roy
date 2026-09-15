"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { Arcade } from "./UniverseArcade";
import s from "./Universe.module.css";

const videos = [
  {
    id: "RxqNGhbBBR4",
    title: "45–18 K-D… AND WE STILL LOST 14–16 😭",
    tag: "THE FULL MATCH",
  },
  {
    id: "WrbJ7W3jIPA",
    title: "They Made Me Cry Throughout The Game, So Just To Hold. 😭",
    tag: "COUNTER-STRIKE",
  },
  {
    id: "0KWHrMJcCOA",
    title: "1V5 Against Semi Rage Cheater. P4P4",
    tag: "CLUTCH ARCHIVE",
  },
  { id: "LPJVv3GrUIM", title: "Sai Anna On Fire.", tag: "WITH THE SQUAD" },
];
const categories = ["Everything", "Products", "Intelligence", "Tools"] as const;
const categoryFor = (slug: string) =>
  slug === "token-usage"
    ? "Tools"
    : ["helios", "texture-forensics", "zenith"].includes(slug)
      ? "Intelligence"
      : "Products";
const symbols = ["◉", "ϟ", "◈", "☀", "⌘"];

export function Universe() {
  const [category, setCategory] = useState<string>("Everything");
  const [playing, setPlaying] = useState<string | null>(null);
  const [motion, setMotion] = useState(true);
  const [copied, setCopied] = useState(false);
  const visible = projects.filter(
    (p) => category === "Everything" || categoryFor(p.slug) === category,
  );
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <main id="main" className={s.universe} data-motion={motion}>
      <section className={s.hero} aria-labelledby="universe-title">
        <div className={s.heroTop}>
          <span>
            <i /> THE PERSONAL UNIVERSE OF AYUSH ROY
          </span>
          <span>EST. IN CURIOSITY / BUILT IN INDIA</span>
        </div>
        <div className={s.heroGrid}>
          <div className={s.heroCopy}>
            <span className={s.eyebrow}>ENGINEER. PLAYER. CREATOR.</span>
            <h1 id="universe-title">
              A little
              <br />
              obsessed.
              <br />
              <em>With possibility.</em>
            </h1>
            <p>
              I turn restless curiosity into products you can explore, games you
              can get lost in, and moments worth replaying.
            </p>
            <div className={s.actions}>
              <a className={s.primary} href="#products">
                Enter my universe <span>↗</span>
              </a>
              <a className={s.textLink} href="#games">
                Take a play break <span>↓</span>
              </a>
            </div>
            <div className={s.signature}>
              <span>AYUSH ROY</span>
              <span>
                INDEPENDENT BUILDER
                <br />
                BHUBANESWAR, INDIA
              </span>
            </div>
          </div>
          <div
            className={s.sculpture}
            aria-label="A rotating red orbital sculpture"
            role="img"
          >
            <div className={s.crosshair} />
            <div className={s.orbital}>
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className={s.orbit}
                  style={{ transform: `rotateY(${i * 20}deg) rotateX(22deg)` }}
                />
              ))}
              <div className={s.innerOrb} />
            </div>
            <div className={s.sculptureWord}>YOR</div>
            <span className={s.sculptureCaption}>IDEAS IN ORBIT</span>
            <span className={s.coordinate}>
              20.2961° N<br />
              85.8245° E
            </span>
          </div>
        </div>
        <div className={s.heroBottom}>
          <span>
            SCROLL TO DISCOVER <b>↓</b>
          </span>
          <span>BUILD SOMETHING. BREAK SOMETHING. LEARN SOMETHING.</span>
          <button onClick={() => setMotion(!motion)} aria-pressed={!motion}>
            {motion ? "Ⅱ PAUSE MOTION" : "▷ RESUME MOTION"}
          </button>
        </div>
      </section>
      <div className={s.ribbon} aria-hidden="true">
        <span>ENGINEERING</span>
        <b>✳</b>
        <span>PLAY</span>
        <b>✳</b>
        <span>CURIOSITY</span>
        <b>✳</b>
        <span>CREATION</span>
        <b>✳</b>
        <span>REPEAT</span>
      </div>
      <section id="products" className={s.section} aria-labelledby="work-title">
        <div className={s.sectionHead}>
          <div>
            <span className={s.eyebrow}>01 / THE COLLECTION</span>
            <h2 id="work-title">
              Made of ideas.
              <br />
              <em>Built to explore.</em>
            </h2>
          </div>
          <p>
            Realtime communities, energy intelligence, and tools for the way we
            work. A few corners of my curiosity, turned into code.
          </p>
        </div>
        <div className={s.filters} aria-label="Filter projects">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
              {c === "Everything" && <sup>{projects.length}</sup>}
            </button>
          ))}
          <span aria-live="polite">{visible.length} PROJECTS</span>
        </div>
        <div className={s.projectGrid}>
          {visible.map((p) => {
            const i = projects.indexOf(p);
            return (
              <article key={p.slug} className={s.project} data-tone={i}>
                <Link
                  className={s.projectVisual}
                  href={`/work/${p.slug}`}
                  aria-label={`Explore ${p.title}`}
                >
                  <span className={s.projectNo}>YOR / {p.index}</span>
                  <div className={s.projectGlyph}>{symbols[i % 5]}</div>
                  <div className={s.visualLines} />
                  <span className={s.visualName}>
                    {p.title.replace("Yor ", "")}
                  </span>
                  <span className={s.roundArrow}>↗</span>
                </Link>
                <div className={s.projectInfo}>
                  <span className={s.eyebrow}>{p.kicker}</span>
                  <h3>
                    <Link href={`/work/${p.slug}`}>{p.title}</Link>
                  </h3>
                  <p>{p.purpose}</p>
                  <div className={s.tags}>
                    {p.technologies.slice(0, 3).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className={s.projectFoot}>
                    <span>{p.status}</span>
                    <a href={p.repo} target="_blank" rel="noopener noreferrer">
                      View code ↗
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <a
          href={profile.links.github}
          className={s.repositoryLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          More experiments live on GitHub <span>↗</span>
        </a>
      </section>
      <section
        id="games"
        className={`${s.section} ${s.arcadeSection}`}
        aria-labelledby="arcade-title"
      >
        <div className={s.sectionHead}>
          <div>
            <span className={s.eyebrow}>02 / OFF THE CLOCK</span>
            <h2 id="arcade-title">
              Serious about
              <br />
              <em>having fun.</em>
            </h2>
          </div>
          <p>
            Stay a little longer. Challenge a friend to chess, chase a pattern,
            or put your keyboard through its paces. No sign-up. Just play.
          </p>
        </div>
        <Arcade />
      </section>
      <section id="videos" className={s.section} aria-labelledby="watch-title">
        <div className={s.sectionHead}>
          <div>
            <span className={s.eyebrow}>03 / PRESS PLAY</span>
            <h2 id="watch-title">
              Some moments
              <br />
              <em>deserve a replay.</em>
            </h2>
          </div>
          <div>
            <p>
              Counter-Strike, clutch attempts, and the chaos in between.
              Creating &amp; recording memories in CS.
            </p>
            <a
              className={s.textLink}
              href="https://www.youtube.com/@YorAyriniwnl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit my YouTube <span>↗</span>
            </a>
          </div>
        </div>
        <div className={s.videoGrid}>
          {videos.map((v, i) => (
            <article key={v.id} className={s.video}>
              <div className={s.videoFrame}>
                {playing === v.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1`}
                    title={v.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <button
                    onClick={() => setPlaying(v.id)}
                    aria-label={`Play ${v.title}`}
                  >
                    <Image
                      src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                      alt=""
                      width={480}
                      height={360}
                      unoptimized
                    />
                    <span className={s.play}>▶</span>
                    <span className={s.videoNumber}>0{i + 1}</span>
                  </button>
                )}
              </div>
              <span className={s.eyebrow}>{v.tag}</span>
              <h3>{v.title}</h3>
              <a
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on YouTube ↗
              </a>
            </article>
          ))}
        </div>
      </section>
      <section id="about" className={s.about}>
        <div className={s.aboutMark} aria-hidden="true">
          Y<span>O</span>R<small>ALWAYS A WORK IN PROGRESS.</small>
        </div>
        <div>
          <span className={s.eyebrow}>04 / THE HUMAN BEHIND IT</span>
          <h2>
            Curiosity is
            <br />
            <em>the common thread.</em>
          </h2>
          <p>
            I’m Ayush, a product and full-stack engineer based in Bhubaneswar. I
            like systems that make sense, interfaces that feel good, and
            problems that refuse to be boring.
          </p>
          <p>
            When I’m not building, you’ll probably find me in a Counter-Strike
            lobby. This space brings both sides together.
          </p>
          <div className={s.actions}>
            <Link className={s.primary} href="/resume">
              The full story <span>↗</span>
            </Link>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={s.textLink}
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </section>
      <section id="contact" className={s.contact}>
        <span className={s.eyebrow}>GOOD THINGS START WITH A CONVERSATION</span>
        <h2>
          Got a wild idea?
          <br />
          <em>Let’s make it real.</em>
        </h2>
        <a className={s.contactEmail} href={`mailto:${profile.email}`}>
          {profile.email} <span>↗</span>
        </a>
        <button className={s.copy} onClick={copyEmail}>
          {copied ? "Email copied ✓" : "Copy email ⧉"}
        </button>
        <div className={s.contactBottom}>
          <span>OPEN TO COLLABORATIONS &amp; OPPORTUNITIES</span>
          <a href="#main">BACK TO TOP ↑</a>
        </div>
      </section>
      <footer className={s.footer}>
        <strong>YOR.</strong>
        <span>© 2026 AYUSH ROY</span>
        <div>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GITHUB ↗
          </a>
          <a
            href="https://www.youtube.com/@YorAyriniwnl"
            target="_blank"
            rel="noopener noreferrer"
          >
            YOUTUBE ↗
          </a>
          <a
            href={profile.links.steam}
            target="_blank"
            rel="noopener noreferrer"
          >
            STEAM ↗
          </a>
        </div>
      </footer>
    </main>
  );
}
