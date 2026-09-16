"use client";

import { ActionLink } from "./ActionLink";
import { ClaimStrip } from "./ClaimStrip";
import { HeroScene } from "./HeroScene";
import { gameRooms, videoWall, youtubeChannel } from "@/content/hub";
import { profile } from "@/content/profile";
import { cvProjects } from "@/content/projects";

export function Home() {
  const sourceLinkedProjects = cvProjects.filter((project) => project.links.source);

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

          <div className="hub-orbit-stage" role="img" aria-label="A crimson YOR signal core surrounded by system rings">
            <div className="hub-orbit-ambient" aria-hidden="true" />
            <div className="hub-hero-scene" aria-hidden="true"><HeroScene showPoster={false} /></div>
            <div className="hub-orbit" aria-hidden="true">
              <span className="hub-orbit-ring hub-orbit-ring-one" />
              <span className="hub-orbit-ring hub-orbit-ring-two" />
              <span className="hub-orbit-ring hub-orbit-ring-three" />
              <span className="hub-orbit-satellite hub-orbit-satellite-one">01</span>
              <span className="hub-orbit-satellite hub-orbit-satellite-two">∞</span>
              <div className="hub-orbit-core"><strong>YOR</strong><span>FIELD HUB</span></div>
            </div>
            <div className="hub-orbit-label hub-orbit-label-top technical">SIGNAL / 01</div>
            <div className="hub-orbit-label hub-orbit-label-bottom technical">SYSTEMS · GAMES · MEDIA</div>
            <div className="hub-orbit-side technical"><span>LIVE INDEX</span><b /><span>OPEN CHANNEL</span></div>
          </div>
        </div>
        <div className="container hub-hero-foot technical"><span>SCROLL TO EXPLORE</span><span>{sourceLinkedProjects.length.toString().padStart(2, "0")} SOURCE-LINKED PRODUCTS</span><span>{profile.location.toUpperCase()}</span></div>
      </section>

      <section className="hub-proof-strip" aria-labelledby="proof-title">
        <div className="container">
          <div className="hub-proof-strip-heading"><span className="technical">00 / RECEIPTS FIRST</span><h2 id="proof-title">Evidence stays<br /><em>attached.</em></h2><p>Every claim below opens the repository or evaluation boundary that supports it. A status can be useful without pretending to be a deployment.</p></div>
          <ClaimStrip projects={["talks", "ai-vs-real"]} compact />
        </div>
      </section>

      <section id="products" className="hub-section hub-products" aria-labelledby="products-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">01 / PRODUCTS &amp; BUILDS</span><h2 id="products-title">Open a door.<br /><em>Inspect the room.</em></h2></div>
            <p>Every product gets a case study for the thinking and an active public source link for the receipt. Deployment claims stay separate from source availability.</p>
          </div>
          <div className="hub-product-grid">
            {cvProjects.map((project, index) => (
              <article key={project.slug} className={`hub-product-card ${index === 0 ? "hub-product-card-featured" : ""}`}>
                <div className="hub-product-art" style={{ backgroundImage: `url("${project.art}")` }}>
                  <span className="technical hub-product-index">{project.index} / {project.period}</span>
                  <span className="technical hub-product-link-state">PUBLIC SOURCE / LINKED</span>
                  <div className="hub-product-art-caption"><span>{project.kicker}</span><span>Repository grounded</span></div>
                </div>
                <div className="hub-product-body">
                  <span className="technical hub-card-kicker">{project.kicker}</span>
                  <h3>{project.title}</h3>
                  <p>{project.purpose}</p>
                  <ul className="hub-tags" aria-label={`${project.title} technologies`}>
                    {project.technologies.slice(0, 4).map((technology) => <li key={technology}>{technology}</li>)}
                  </ul>
                  <div className="hub-product-status"><span>{project.status}</span><span>{project.period}</span></div>
                  <div className="actions hub-card-actions"><ActionLink href={`/projects/${project.slug}`} primary>Case study</ActionLink><ActionLink href={`/projects/${project.slug}/source`}>Source link</ActionLink>{project.availability.live === "verified" && project.links.live && <ActionLink href={`/projects/${project.slug}/live`}>View live</ActionLink>}</div>
                </div>
              </article>
            ))}
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

      <section id="games" className="hub-section hub-games" aria-labelledby="games-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">03 / GAME ROOMS</span><h2 id="games-title">A separate<br /><em>kind of focus.</em></h2></div>
            <p>Games get their own shelf: small worlds with clear rules, satisfying feedback, and enough personality to come back to.</p>
          </div>
          <div className="hub-games-layout">
            <article className="hub-chess-card">
              <div className="hub-chess-top"><span className="technical">ROOM 01 / YOR CHESS</span><span className="technical">STRATEGY</span></div>
              <div className="hub-chess-board" role="img" aria-label="Decorative chessboard for the YOR Chess room">
                {Array.from({ length: 64 }, (_, index) => <span key={index} className={`hub-chess-square ${((Math.floor(index / 8) + index) % 2 === 0) ? "hub-chess-light" : "hub-chess-dark"}`} />)}
                <span className="hub-chess-knight" aria-hidden="true">♞</span>
                <span className="hub-chess-coordinate hub-chess-coordinate-a">A</span><span className="hub-chess-coordinate hub-chess-coordinate-h">H</span>
              </div>
              <div className="hub-chess-copy"><span className="technical">ROOM CONCEPT</span><h3>Chess as a place.</h3><p>A future room for slower thinking, sharper moves, and a board that feels like it belongs to YOR.</p></div>
            </article>
            <div className="hub-game-list">
              {gameRooms.slice(1).map((game) => (
                <article className="hub-game-row" key={game.title}>
                  <span className="hub-game-mark" aria-hidden="true">{game.mark}</span>
                  <div><span className="technical">{game.index} / {game.genre}</span><h3>{game.title}</h3><p>{game.description}</p></div>
                  <span className="technical hub-game-status">{game.status}</span>
                </article>
              ))}
              <div className="hub-game-footer"><p>Game rooms are being designed as a distinct part of the site, not buried inside the portfolio grid.</p><ActionLink href={profile.links.github} external>Browse build source</ActionLink></div>
            </div>
          </div>
        </div>
      </section>

      <section id="videos" className="hub-section hub-videos" aria-labelledby="videos-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">04 / VIDEO WALL</span><h2 id="videos-title">Make the work<br /><em>watchable.</em></h2></div>
            <p>A channel-facing wall for build logs, game-room cuts, studio notes, and the context that never fits inside a screenshot.</p>
          </div>
          <div className="hub-video-wall">
            {videoWall.map((item) => (
              <article className={`hub-video-card hub-video-card-${item.tone}`} key={item.index}>
                <div className="hub-video-poster"><span className="technical hub-video-stamp">{item.index} / {item.category}</span><span className="hub-video-glyph" aria-hidden="true">▶</span><span className="technical hub-video-poster-foot">YOR / CHANNEL FEED</span></div>
                <div className="hub-video-copy"><span className="technical">FEED SLOT / READY</span><h3>{item.title}</h3><p>{item.description}</p></div>
              </article>
            ))}
          </div>
          <div className="hub-video-connect"><div><span className="technical">CHANNEL CONNECTION</span><h3>{youtubeChannel ? "Channel link configured." : "The wall is ready for your channel."}</h3><p>{youtubeChannel ? "The public link is ready; real thumbnails and embeds stay off until the channel is checked live." : "The YouTube URL is the only missing input. Real thumbnails and embeds stay off until the correct channel is confirmed."}</p></div>{youtubeChannel ? <ActionLink href={youtubeChannel} external primary>Open channel</ActionLink> : <span className="technical hub-pending">CHANNEL URL PENDING</span>}</div>
        </div>
      </section>

      <section id="about" className="hub-section hub-about" aria-labelledby="about-title">
        <div className="container">
          <div className="hub-about-frame">
            <div className="hub-about-intro"><span className="technical hub-section-kicker">05 / ABOUT THE BUILDER</span><h2 id="about-title">A portfolio<br /><em>with a pulse.</em></h2><p>{profile.positioning}</p><div className="actions"><ActionLink href={profile.links.github} external primary>GitHub / source</ActionLink><ActionLink href={profile.links.linkedin} external>LinkedIn</ActionLink></div></div>
            <div className="hub-about-details">
              <div className="hub-detail-block"><span className="technical">NOW</span><strong>{profile.role}</strong><p>Building product systems at the intersection of interfaces, realtime infrastructure, and applied intelligence.</p></div>
              <div className="hub-detail-block"><span className="technical">BASED IN</span><strong>{profile.location}</strong><p>Open to thoughtful collaborations, technical conversations, and the next ambitious build.</p></div>
              <div className="hub-detail-block"><span className="technical">PUBLIC CHANNELS</span><div className="hub-channel-list"><a href={profile.links.github} target="_blank" rel="noopener noreferrer"><span>GitHub</span><span>Source / linked ↗</span></a><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><span>Profile / public ↗</span></a><a href={profile.links.steam} target="_blank" rel="noopener noreferrer"><span>Steam</span><span>Personal / public ↗</span></a></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="hub-contact" aria-labelledby="contact-title">
        <div className="container hub-contact-inner"><span className="technical">06 / OPEN CHANNEL</span><h2 id="contact-title">Have a room<br /><em>worth building?</em></h2><a className="hub-email" href={`mailto:${profile.email}`}>{profile.email}</a><div className="actions"><ActionLink href={`mailto:${profile.email}`} external primary>Start a conversation</ActionLink><ActionLink href="/resume">Resume</ActionLink></div></div>
      </section>

      <footer className="container hub-footer"><span>AYUSH ROY <i>·</i> YOR <i>·</i> 2026</span><span>FIELD HUB / SOURCE-LINKED / EVIDENCE-LABELED</span></footer>
    </main>
  );
}
