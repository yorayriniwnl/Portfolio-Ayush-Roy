"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

type SkillGroup = "Languages" | "Frontend" | "Backend" | "Data" | "Tooling";
type Skill = { symbol: string; name: string; group: SkillGroup; description: string };
const skills: Skill[] = [
  { symbol: "Py", name: "Python", group: "Languages", description: "Services, automation and applied ML workflows." },
  { symbol: "Ts", name: "TypeScript", group: "Languages", description: "Typed interfaces and product engineering." },
  { symbol: "Js", name: "JavaScript", group: "Languages", description: "Browser interactions and full-stack systems." },
  { symbol: "C+", name: "C++", group: "Languages", description: "Algorithms, programming fundamentals and performance." },
  { symbol: "Sq", name: "SQL", group: "Languages", description: "Relational modeling and practical query design." },
  { symbol: "Re", name: "React", group: "Frontend", description: "Accessible interfaces with thoughtful interactions." },
  { symbol: "Nx", name: "Next.js", group: "Frontend", description: "Server-rendered products and route-driven experiences." },
  { symbol: "Ht", name: "HTML", group: "Frontend", description: "Semantic structure and browser accessibility." },
  { symbol: "Cs", name: "CSS", group: "Frontend", description: "Responsive layouts and motion-aware design." },
  { symbol: "3D", name: "Three.js", group: "Frontend", description: "Experiments in interactive WebGL worlds." },
  { symbol: "Fa", name: "FastAPI", group: "Backend", description: "Typed Python APIs and asynchronous services." },
  { symbol: "No", name: "Node.js", group: "Backend", description: "Server-side JavaScript and realtime APIs." },
  { symbol: "Ws", name: "WebSockets", group: "Backend", description: "Realtime messaging and event delivery." },
  { symbol: "Au", name: "Auth", group: "Backend", description: "Authentication and server-side trust boundaries." },
  { symbol: "Pg", name: "PostgreSQL", group: "Data", description: "Durable relational storage and SQL queries." },
  { symbol: "Rd", name: "Redis", group: "Data", description: "Queues, caches and ephemeral coordination." },
  { symbol: "Ml", name: "Applied ML", group: "Data", description: "Evaluation-driven ML experiments and evidence." },
  { symbol: "Dr", name: "Drizzle", group: "Data", description: "Typed database access and schema migrations." },
  { symbol: "Gi", name: "Git", group: "Tooling", description: "Version control and code review workflows." },
  { symbol: "Gh", name: "GitHub Actions", group: "Tooling", description: "Automated testing and continuous integration." },
  { symbol: "Do", name: "Docker", group: "Tooling", description: "Repeatable application packaging and smoke tests." },
  { symbol: "Ve", name: "Vercel", group: "Tooling", description: "Production frontend deployments and previews." },
  { symbol: "Li", name: "Linux", group: "Tooling", description: "Command-line development and deployment workflows." },
];
const groups: Array<"All" | SkillGroup> = ["All", "Languages", "Frontend", "Backend", "Data", "Tooling"];

export function EditorialSkills() {
  const [group, setGroup] = useState<(typeof groups)[number]>("All");
  const [selected, setSelected] = useState<Skill>(skills[0]);
  const shown = group === "All" ? skills : skills.filter((skill) => skill.group === group);
  const updateGroup = (next: (typeof groups)[number]) => {
    setGroup(next);
    const first = next === "All" ? skills[0] : skills.find((skill) => skill.group === next);
    if (first) setSelected(first);
  };

  return (
    <section id="skills" className="editorial-skills editorial-section editorial-wrap" aria-labelledby="editorial-skills-title">
      <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 02 / THE TOOLBOX</div>
      <div className="editorial-skills__heading">
        <h2 id="editorial-skills-title" data-essential-copy>The periodic table <em>of my stack.</em></h2>
        <p>Different tools, one goal: building something useful. Pick an element to see how it fits into the work.</p>
      </div>
      <div className="editorial-skills__filters" aria-label="Filter skills">
        {groups.map((item) => (
          <button type="button" className={group === item ? "is-active" : ""} key={item}
            aria-pressed={group === item} onClick={() => updateGroup(item)}>{item}</button>
        ))}
      </div>
      <div className="editorial-skills__matrix" role="group" aria-label="Interactive technology skills">
        {shown.map((skill, index) => (
          <button type="button" key={skill.name} onClick={() => setSelected(skill)}
            aria-pressed={skill.name === selected.name}
            className={`editorial-element editorial-element--${skill.group.toLowerCase()} ${skill.name === selected.name ? "is-selected" : ""}`}
            aria-label={`${skill.name}, ${skill.group}`}>
            <span className="editorial-element__index">{String(skills.indexOf(skill) + 1).padStart(2, "0")}</span>
            <strong>{skill.symbol}</strong>
            <span className="editorial-element__name">{skill.name}</span>
          </button>
        ))}
      </div>
      <div className="editorial-skills__detail" role="status" aria-live="polite">
        <div><span>SELECTED ELEMENT / {String(skills.indexOf(selected) + 1).padStart(2, "0")}</span><h3>{selected.name}</h3><p>{selected.description}</p></div>
        <span className="editorial-skills__detail-tag">{selected.group}</span>
      </div>
    </section>
  );
}

export type EditorialProject = {
  slug: string;
  title: string;
  kicker: string;
  period: string;
  purpose: string;
  outcome: string;
  technologies: string[];
  art: string;
  live: string | null;
  source: string | null;
};

export function EditorialWork({ projects }: { projects: EditorialProject[] }) {
  const [index, setIndex] = useState(0);
  const count = projects.length;
  const project = projects[index];
  if (!project || count === 0) return null;
  const move = (delta: number) => setIndex((current) => (current + delta + count) % count);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
  };
  const artStyle = { backgroundImage: `url("${project.art}")` } as CSSProperties;

  return (
    <section id="projects" className="editorial-projects editorial-section editorial-wrap" aria-labelledby="editorial-projects-title" data-experience-section="projects">
      <div className="editorial-kicker"><span className="editorial-kicker__dot" /> 03 / SELECTED PROJECTS</div>
      <div className="editorial-projects__heading"><h2 id="editorial-projects-title" data-essential-copy>Things I've <em>built.</em></h2><Link href="/projects">View all case studies ↗</Link></div>
      <div className="editorial-projects__stage" tabIndex={0} onKeyDown={onKeyDown}
        role="region" aria-roledescription="carousel" aria-label="Selected engineering projects">
        <div className="editorial-projects__rail" aria-hidden="true"><span>SELECTED WORK</span><span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span></div>
        <div className="editorial-projects__story" key={project.slug}>
          <span className="editorial-projects__meta">№ {String(index + 1).padStart(2, "0")} &nbsp; / &nbsp; {project.kicker} &nbsp; / &nbsp; {project.period}</span>
          <h3>{project.title}</h3><p className="editorial-projects__purpose">{project.purpose}</p>
          <p className="editorial-projects__outcome">{project.outcome}</p>
          <div className="editorial-projects__tags">{project.technologies.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <div className="editorial-projects__actions">
            <Link className="editorial-pill editorial-pill--dark" href={`/projects/${project.slug}`}>Explore case study ↗</Link>
            {project.source && <Link href={project.source}>Source ↗</Link>}
            {project.live && <Link href={project.live}>Live ↗</Link>}
          </div>
        </div>
        <div className="editorial-projects__art" key={`art-${project.slug}`} style={artStyle} role="img" aria-label={`Illustrated artwork for ${project.title}`}>
          <span>YOR / {project.slug.toUpperCase()}</span><span className="editorial-projects__art-mark">↗</span>
        </div>
        <div className="editorial-projects__controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous project">←</button>
          <span aria-live="polite">{String(index + 1).padStart(2, "0")} <span>/ {String(count).padStart(2, "0")}</span></span>
          <button type="button" onClick={() => move(1)} aria-label="Next project">→</button>
        </div>
      </div>
      <div className="editorial-projects__dots" role="group" aria-label="Choose project">
        {projects.map((item, idx) => <button type="button" key={item.slug} className={index === idx ? "is-active" : ""}
          aria-pressed={index === idx} aria-label={`Show ${item.title}`} onClick={() => setIndex(idx)} />)}
      </div>
    </section>
  );
}
