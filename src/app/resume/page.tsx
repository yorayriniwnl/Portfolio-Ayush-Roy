import type { Metadata } from "next";
import Link from "next/link";
import { ActionLink } from "@/components/ActionLink";
import { profile } from "@/content/profile";
import { getResumeMetadata } from "@/content/project-seo";
import { recruiterProjects } from "@/content/project-registry";

export const metadata: Metadata = getResumeMetadata();

export default function Resume() {
  return (
    <main id="main" className="resume-page container" data-experience-surface="resume">
      <header className="resume-hero">
        <span className="technical">Resume / public reading view</span>
        <h1 className="resume-hero__name">{profile.name}</h1>
        <p className="resume-hero__role">{profile.role}</p>
        <p className="resume-hero__positioning">{profile.positioning}</p>
        <div className="actions resume-hero__actions" aria-label="Resume and profile links">
          <ActionLink href="/media/Ayush_Roy_Resume.pdf" external primary>Open PDF</ActionLink>
          <ActionLink href={`mailto:${profile.email}`} external>Email</ActionLink>
          <ActionLink href={profile.links.github} external>GitHub</ActionLink>
          <ActionLink href={profile.links.linkedin} external>LinkedIn</ActionLink>
        </div>
      </header>

      <section className="resume-section" aria-labelledby="selected-work-title">
        <div className="resume-section__heading">
          <span className="technical">01 / EVIDENCE</span>
          <h2 id="selected-work-title">Selected work.</h2>
          <p>Six canonical projects with source-backed contribution boundaries and explicit outcomes.</p>
        </div>
        <div className="resume-project-list">
          {recruiterProjects.map((project) => (
            <article className="resume-project" key={project.slug} data-project-slug={project.slug}>
              <span className="technical resume-project__index">{project.index}</span>
              <div className="resume-project__body">
                <div className="resume-project__meta">
                  <span className="technical">{project.period}</span>
                  <span className="technical">{project.status}</span>
                </div>
                <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
                <p className="resume-project__role">{project.role}</p>
                <p className="resume-project__outcome">{project.outcome}</p>
                <div className="actions resume-project__actions">
                  <ActionLink href={`/projects/${project.slug}`} primary>Case study</ActionLink>
                  {project.availability.source === "verified" && project.links.source && <ActionLink href={`/projects/${project.slug}/source`}>Source</ActionLink>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="resume-section resume-section--education" aria-labelledby="education-title">
        <div className="resume-section__heading">
          <span className="technical">02 / FOUNDATION</span>
          <h2 id="education-title">Education &amp; training.</h2>
          <p>Verified academic and internship experience.</p>
        </div>
        <div className="resume-education-list">
          <article className="resume-education">
            <span className="technical">2023–2027 (Expected)</span>
            <h3>B.Tech in Computer Science and Communication Engineering</h3>
            <p>KIIT Deemed University</p>
          </article>
          <article className="resume-education">
            <span className="technical">June 2026 · Chennai (Hybrid)</span>
            <h3>Bharat Sanchar Nigam Limited (BSNL)</h3>
            <p>Telecom &amp; Data Network Intern</p>
          </article>
        </div>
      </section>
    </main>
  );
}
