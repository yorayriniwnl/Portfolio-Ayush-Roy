export type ClaimStatus = "verified" | "supported" | "experimental" | "historical";

export type Claim = {
  id: string;
  project: string;
  claim: string;
  value: string;
  unit?: string;
  status: ClaimStatus;
  method: string;
  source: string;
  lastVerified: string;
  evidenceUrl: string;
};

export const claims: readonly Claim[] = [
  {
    id: "portfolio-system",
    project: "portfolio",
    claim: "Public project system",
    value: "Six CV projects",
    status: "supported",
    method: "Canonical registry and route contract in this repository",
    source: "Portfolio repository",
    lastVerified: "2026-09-17",
    evidenceUrl: "https://github.com/yorayriniwnl/Portfolio-Ayush-Roy",
  },
  {
    id: "talks-realtime-stack",
    project: "talks",
    claim: "Core realtime stack",
    value: "PostgreSQL · Redis · WebSockets",
    status: "supported",
    method: "Repository architecture and readiness audit",
    source: "Yor Talks repository / 31 Aug 2026 audit",
    lastVerified: "2026-08-31",
    evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2",
  },
  {
    id: "talks-release-boundary",
    project: "talks",
    claim: "Release boundary",
    value: "Deployment blocked",
    status: "supported",
    method: "Repository release notes and readiness audit",
    source: "Yor Talks repository / 31 Aug 2026 audit",
    lastVerified: "2026-08-31",
    evidenceUrl: "https://github.com/yorayriniwnl/yor-talksv2",
  },
  {
    id: "helios-deterministic-demo",
    project: "helios",
    claim: "Portfolio interaction",
    value: "Deterministic demo",
    status: "experimental",
    method: "Fixed sample telemetry and repository-described behavior",
    source: "Yor Helios repository",
    lastVerified: "2026-08-31",
    evidenceUrl: "https://github.com/yorayriniwnl/Yor-Helios",
  },
  {
    id: "texture-holdout-accuracy",
    project: "ai-vs-real",
    claim: "Holdout accuracy",
    value: "78.5",
    unit: "% on a 107-image holdout",
    status: "verified",
    method: "Repository-stated evaluation result",
    source: "Texture Forensics repository",
    lastVerified: "2026-08-31",
    evidenceUrl: "https://github.com/yorayriniwnl/Yor-Ai-vs-real-image",
  },
  {
    id: "zenith-interface-attribution",
    project: "zenith",
    claim: "Contribution",
    value: "Interface direction",
    status: "supported",
    method: "Repository attribution",
    source: "Yor Zenith repository",
    lastVerified: "2026-08-31",
    evidenceUrl: "https://github.com/yorayriniwnl/Yor-Zenith",
  },
  {
    id: "token-usage-estimates",
    project: "token-usage",
    claim: "Measurement boundary",
    value: "Estimated counts",
    status: "supported",
    method: "Local analysis path; provider billing is out of scope",
    source: "Yor Token Usage repository",
    lastVerified: "2026-08-31",
    evidenceUrl: "https://github.com/yorayriniwnl/Yor_Token_Usage",
  },
] as const;

export function claimsFor(project: string) {
  return claims.filter((claim) => claim.project === project);
}
