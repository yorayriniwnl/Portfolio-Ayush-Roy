import { ActionLink } from "./ActionLink";
import type { Project } from "@/content/projects";

export function ProjectLinkUnavailable({
  project,
  kind,
  reason,
}: {
  project: Project;
  kind: "live" | "source";
  reason: string;
}) {
  const label = kind === "live" ? "Live product" : "Source repository";

  return (
    <main id="main" className="container link-unavailable">
      <span className="technical">{project.index} / {project.kicker} / resolver state</span>
      <h1 className="display">{label}<br /><em>not available.</em></h1>
      <p className="link-unavailable-project">{project.title}</p>
      <p className="reading muted">{reason}</p>
      <div className="actions">
        <ActionLink href={`/projects/${project.slug}`} primary>Read case study</ActionLink>
        <ActionLink href="/projects">All selected work</ActionLink>
        {project.availability.source === "verified" && project.links.source && <ActionLink href={`/projects/${project.slug}/source`}>Inspect source</ActionLink>}
      </div>
    </main>
  );
}
