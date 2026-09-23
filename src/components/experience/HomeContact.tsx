import Link from "next/link";
import { profile } from "@/content/profile";

export function HomeContact() {
  return (
    <section id="contact" className="machine-contact" data-experience-section="contact" aria-labelledby="contact-title">
      <div className="machine-container machine-contact__inner">
        <p className="machine-section-index"><span>03</span> / OPEN CHANNEL</p>
        <h2 id="contact-title">
          <span>LET&apos;S BUILD</span>{" "}
          <span>SOMETHING</span>{" "}
          <span>THAT SHOULDN&apos;T</span>{" "}
          <span>BE BORING.</span>
        </h2>
        <a className="machine-contact__email" href={"mailto:" + profile.email}>{profile.email}<span aria-hidden="true">↗</span></a>
        <nav className="machine-contact__links" aria-label="Contact and profile links">
          <a href={"mailto:" + profile.email}>EMAIL</a>
          <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GITHUB</a>
          <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
          <Link href="/resume">RESUME</Link>
        </nav>
        <footer className="machine-contact__footer">
          <span>YOR / AYUSH ROY</span>
          <a href="#main">BACK TO TOP ↑</a>
        </footer>
      </div>
    </section>
  );
}
