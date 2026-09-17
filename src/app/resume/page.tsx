import type { Metadata } from "next";
import { ActionLink } from "@/components/ActionLink";
import { profile } from "@/content/profile";
import { getResumeMetadata } from "@/content/project-seo";
import { cvProjects } from "@/content/project-registry";

export const metadata: Metadata = getResumeMetadata();

export default function Resume() {
  return (
    <main id="main" className="container" style={{ paddingTop: 150, paddingBottom: 110 }}>
      <span className="technical">Resume / public reading view</span>
      <h1 className="display" style={{ fontSize: "clamp(72px,12vw,150px)", lineHeight: 0.78, margin: "20px 0 26px" }}>
        {profile.name}
      </h1>
      <p style={{ fontSize: 20, color: "var(--signal)" }}>{profile.role}</p>
      <p className="reading muted" style={{ lineHeight: 1.75, fontSize: 17 }}>{profile.positioning}</p>
      <div className="actions" style={{ marginBottom: 78 }}>
        <ActionLink href="/media/Ayush_Roy_Resume.pdf" external primary>Open PDF</ActionLink>
        <ActionLink href={`mailto:${profile.email}`} external>Email</ActionLink>
        <ActionLink href={profile.links.github} external>GitHub</ActionLink>
        <ActionLink href={profile.links.linkedin} external>LinkedIn</ActionLink>
      </div>

      <section aria-labelledby="selected-work-title">
        <h2 id="selected-work-title" className="display" style={{ fontSize: 52 }}>Selected work</h2>
        {cvProjects.map((project) => (
          <article key={project.slug} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 22, padding: "24px 0", borderTop: "1px solid var(--line)" }}>
            <span className="technical">{project.index}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 23 }}><a href={`/projects/${project.slug}`}>{project.title}</a></h3>
              <p className="muted" style={{ lineHeight: 1.65 }}>{project.role} · {project.status}<br />{project.outcome}</p>
              <div className="actions"><ActionLink href={`/projects/${project.slug}`}>Case study</ActionLink><ActionLink href={`/projects/${project.slug}/source`}>Source</ActionLink></div>
            </div>
          </article>
        ))}
      </section>

      <section className="section" aria-labelledby="education-title">
        <h2 id="education-title" className="display" style={{ fontSize: 52 }}>Education &amp; training</h2>
        <p className="reading muted" style={{ lineHeight: 1.8 }}>B.Tech in Computer Science and Communication Engineering · KIIT Deemed University · 2023–2027 (Expected).</p>
        <p className="reading muted" style={{ lineHeight: 1.8 }}>Bharat Sanchar Nigam Limited (BSNL) · Telecom &amp; Data Network Intern · June 2026 · Chennai (Hybrid).</p>
      </section>
    </main>
  );
}
