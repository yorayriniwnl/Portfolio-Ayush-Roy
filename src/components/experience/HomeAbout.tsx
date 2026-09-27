import { profile } from "@/content/profile";

export function HomeAbout() {
  return (
    <section id="about" className="machine-about" data-experience-section="about" aria-labelledby="about-title">
      <div className="machine-container">
        <header className="machine-section-heading machine-about__heading">
          <p className="machine-section-index"><span>02</span> / BUILDER PROFILE</p>
          <div>
            <h2 id="about-title">INTERFACES.<br /><em>SYSTEMS. CONSEQUENCE.</em></h2>
            <p>{profile.positioning}</p>
          </div>
          <span className="machine-section-heading__axis" aria-hidden="true">AYUSH ROY / YOR</span>
        </header>

        <dl className="machine-about__facts">
          <div>
            <dt>ROLE</dt>
            <dd>{profile.role}</dd>
          </div>
          <div>
            <dt>PROFESSIONAL FOCUS</dt>
            <dd>{profile.headline}</dd>
          </div>
          <div>
            <dt>BASED IN</dt>
            <dd>{profile.location}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
