import { claims, claimsFor } from "@/content/claims";

export function ClaimStrip({ project, projects, claimIds, compact = false }: { project?: string; projects?: readonly string[]; claimIds?: readonly string[]; compact?: boolean }) {
  const projectClaims = claimIds ? claims.filter((claim) => claimIds.includes(claim.id)) : project ? claimsFor(project) : claims.filter((claim) => projects?.includes(claim.project));

  if (!projectClaims.length) return null;

  return (
    <ul className={`claim-strip${compact ? " claim-strip-compact" : ""}`} aria-label="Evidence claims">
      {projectClaims.map((claim) => (
        <li key={claim.id}><a className="claim-card" href={claim.evidenceUrl} target="_blank" rel="noopener noreferrer">
          <span className="claim-card-top"><span className={`claim-status claim-status-${claim.status}`}>{claim.status}</span><span className="technical">{claim.lastVerified}</span></span>
          <strong>{claim.value}{claim.unit && <small>{claim.unit}</small>}</strong>
          <span className="claim-label">{claim.claim}</span>
          <span className="claim-method">{claim.method}</span>
          <span className="claim-source">{claim.source} ↗</span>
        </a></li>
      ))}
    </ul>
  );
}
