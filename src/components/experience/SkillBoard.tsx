"use client";

import { useState } from "react";

type Category = "All" | "Languages" | "Frontend" | "Backend" | "Tools";
type Skill = { name: string; code: string; category: Exclude<Category, "All">; detail: string };

const skills: readonly Skill[] = [
  { name: "Python", code: "Py", category: "Languages", detail: "Backend services, automation, data processing, and applied ML." },
  { name: "TypeScript", code: "Ts", category: "Languages", detail: "Type-safe full-stack application development." },
  { name: "JavaScript", code: "Js", category: "Languages", detail: "Interactive application logic across browsers and servers." },
  { name: "SQL", code: "SQL", category: "Languages", detail: "Relational queries, modeling, and evidence-driven data work." },
  { name: "C++", code: "C++", category: "Languages", detail: "Foundational programming, algorithms, and performance-aware thinking." },
  { name: "React", code: "Re", category: "Frontend", detail: "Component-based interactive user interfaces." },
  { name: "Next.js", code: "Nx", category: "Frontend", detail: "Server-rendered websites, application routes, and deployment workflows." },
  { name: "CSS", code: "Css", category: "Frontend", detail: "Responsive layouts, design systems, and thoughtful visual details." },
  { name: "Three.js", code: "3D", category: "Frontend", detail: "Interactive real-time visuals and experimental 3D interfaces." },
  { name: "Node.js", code: "Nd", category: "Backend", detail: "JavaScript and TypeScript services for full-stack products." },
  { name: "FastAPI", code: "Api", category: "Backend", detail: "Typed Python APIs and service boundaries." },
  { name: "PostgreSQL", code: "Pg", category: "Backend", detail: "Relational data modeling and durable application state." },
  { name: "Redis", code: "Rd", category: "Backend", detail: "Caching, queues, and transient coordination." },
  { name: "Socket.IO", code: "Ws", category: "Backend", detail: "Realtime communication and event-driven application flows." },
  { name: "Git", code: "Git", category: "Tools", detail: "Version control and traceable collaboration." },
  { name: "Docker", code: "Dk", category: "Tools", detail: "Portable development and deployment environments." },
  { name: "GitHub Actions", code: "CI", category: "Tools", detail: "Automated tests, builds, and deployment validation." },
  { name: "Vercel", code: "Vc", category: "Tools", detail: "Frontend deployment, hosting, and delivery pipelines." },
  { name: "Linux", code: "Ln", category: "Tools", detail: "Development tooling, servers, and automation." },
];

const categories: readonly Category[] = ["All", "Languages", "Frontend", "Backend", "Tools"];

export function SkillBoard() {
  const [category, setCategory] = useState<Category>("All");
  const [selected, setSelected] = useState("Python");
  const filtered = category === "All" ? skills : skills.filter((skill) => skill.category === category);
  const current = skills.find((skill) => skill.name === selected) ?? skills[0];
  return (
    <div className="ref-skill-board">
      <div className="ref-skill-top">
        <div className="ref-skill-filters" role="group" aria-label="Filter technologies">
          {categories.map((item) => (
            <button type="button" key={item} className={category === item ? "is-active" : ""}
              aria-pressed={category === item} onClick={() => { setCategory(item); const first = item === "All" ? skills[0] : skills.find((skill) => skill.category === item); if (first) setSelected(first.name); }}>
              {item}
            </button>
          ))}
        </div>
        <span className="ref-mono">CLICK TO EXPLORE / {String(filtered.length).padStart(2, "0")} TOOLS</span>
      </div>
      <div className="ref-skill-layout">
        <div className="ref-skill-keys" role="group" aria-label="Technology skills">
          {filtered.map((skill, index) => (
            <button type="button" key={skill.name} onClick={() => setSelected(skill.name)}
              aria-pressed={current.name === skill.name} className={"ref-skill-key" + (current.name === skill.name ? " is-selected" : "")}>
              <span className="ref-skill-key-code">{skill.code}</span>
              <span className="ref-skill-key-name">{skill.name}</span>
              <span className="ref-skill-key-index">{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        <div className="ref-skill-detail" aria-live="polite" aria-atomic="true">
          <span className="ref-mono">CURRENTLY SELECTED / {current.category.toUpperCase()}</span>
          <div className="ref-skill-detail-icon" aria-hidden="true">{current.code}</div>
          <h3>{current.name}<span>✳</span></h3>
          <p>{current.detail}</p>
          <span className="ref-skill-detail-footer">ALWAYS MORE TO LEARN ↗</span>
        </div>
      </div>
    </div>
  );
}
