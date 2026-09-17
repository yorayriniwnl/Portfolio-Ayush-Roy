import { ActionLink } from "./ActionLink";
import { gameRooms, videoWall, youtubeChannel } from "@/content/hub";
import { profile } from "@/content/profile";

export function Lab() {
  return (
    <main id="main" className="hub-page lab-page">
      <section className="hub-section hub-lab-intro" aria-labelledby="lab-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">YOR / EXPERIMENTAL FIELD</span><h1 id="lab-title" className="lab-title">Play without<br /><em>pretending.</em></h1></div>
            <p>These are concepts, interface studies, and media experiments. Status is intentionally explicit so a prototype never masquerades as a shipped product.</p>
          </div>
          <div className="actions"><ActionLink href="/projects" primary>Back to engineering work</ActionLink></div>
        </div>
      </section>

      <section className="hub-section hub-games" aria-labelledby="games-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">01 / GAME ROOMS</span><h2 id="games-title">A separate<br /><em>kind of focus.</em></h2></div>
            <p>Small worlds with clear rules and strong feedback. Every room stays labeled as a concept until it becomes a functioning public experience.</p>
          </div>
          <div className="hub-games-layout">
            <article className="hub-chess-card">
              <div className="hub-chess-top"><span className="technical">ROOM 01 / YOR CHESS</span><span className="technical">CONCEPT</span></div>
              <div className="hub-chess-board" role="img" aria-label="Decorative chessboard for the YOR Chess concept">
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
              <div className="hub-game-footer"><p>Nothing here is recruiter-facing evidence until the implementation earns that status.</p><ActionLink href={profile.links.github} external>Browse public source</ActionLink></div>
            </div>
          </div>
        </div>
      </section>

      <section className="hub-section hub-videos" aria-labelledby="videos-title">
        <div className="container">
          <div className="hub-section-heading">
            <div><span className="technical hub-section-kicker">02 / VIDEO WALL</span><h2 id="videos-title">Ideas that may<br /><em>become watchable.</em></h2></div>
            <p>Reserved editorial concepts stay here until real published media exists. No placeholder is presented as an actual video.</p>
          </div>
          <div className="hub-video-wall">
            {videoWall.map((item) => (
              <article className={`hub-video-card hub-video-card-${item.tone}`} key={item.index}>
                <div className="hub-video-poster"><span className="technical hub-video-stamp">{item.index} / {item.category}</span><span className="hub-video-glyph" aria-hidden="true">◇</span><span className="technical hub-video-poster-foot">YOR / EDITORIAL CONCEPT</span></div>
                <div className="hub-video-copy"><span className="technical">CONCEPT / NOT PUBLISHED</span><h3>{item.title}</h3><p>{item.description}</p></div>
              </article>
            ))}
          </div>
          <div className="hub-video-connect"><div><span className="technical">PUBLIC CHANNEL</span><h3>{youtubeChannel ? "The actual channel is separate from these concepts." : "Channel connection pending."}</h3><p>Only published material belongs on the public channel. This wall remains an experimental planning surface.</p></div>{youtubeChannel ? <ActionLink href={youtubeChannel} external primary>Open actual channel</ActionLink> : <span className="technical hub-pending">CHANNEL URL PENDING</span>}</div>
        </div>
      </section>
    </main>
  );
}
