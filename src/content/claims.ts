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
    id: "candidatex-paper-benchmark",
    project: "candidatex",
    claim: "Submitted-paper controlled benchmark",
    value: "28,800",
    unit: " candidate-role evaluations",
    status: "supported",
    method: "Paper-reported synthetic controlled benchmark: 16 seeds × 300 candidate profiles × 6 target roles; not real-world hiring validation",
    source: "CandidateX paper benchmark provenance manifest",
    lastVerified: "2026-09-17",
    evidenceUrl: "https://github.com/yorayriniwnl/CandidateX/blob/main/research/paper_benchmark_manifest.json",
  },
  {
    id: "candidatex-supplementary-ablation",
    project: "candidatex",
    claim: "Repository supplementary implementation ablation",
    value: "4,800",
    unit: " synthetic role-specific samples",
    status: "experimental",
    method: "Separate repository ablation harness used for implementation diagnostics; not the submitted paper headline benchmark",
    source: "CandidateX repository research harness",
    lastVerified: "2026-09-17",
    evidenceUrl: "https://github.com/yorayriniwnl/CandidateX/blob/main/research/run_paper_experiments.py",
  },
  {
    id: "avelry-release-review-tests",
    project: "avelry",
    claim: "Web-release review test results",
    value: "855 API · 345 Chromium",
    unit: " passing tests",
    status: "supported",
    method: "Recorded in the 4 Nov 2026 web-release review: 855 standard API cases and 345 default Chromium end-to-end tests passed (13 disabled-feature skips, zero failures). Private repository; describes one reviewed build, not uptime or scale",
    source: "Avelry web-release review, 4 Nov 2026",
    lastVerified: "2026-11-17",
    evidenceUrl: "https://avelry.in",
  },
  {
    id: "avelry-protection-levels",
    project: "avelry",
    claim: "Emergency protection levels",
    value: "4",
    unit: " levels: normal, guarded, read-only, offline",
    status: "supported",
    method: "Protection-gate middleware and the operator runbook for emergency controls in the private Avelry repository",
    source: "Avelry emergency controls runbook",
    lastVerified: "2026-11-17",
    evidenceUrl: "https://avelry.in",
  },
  {
    id: "velvetclip-completion-audit-tests",
    project: "velvetclip",
    claim: "Automated tests",
    value: "218 + 49",
    unit: " unit tests (33 suites) + Playwright browser tests, all passing",
    status: "supported",
    method: "Recorded in the Velvetclip master completion audit (docs/MASTER_COMPLETION_AUDIT.md) alongside 45 compiled routes: 218/218 Vitest unit tests and 49/49 Playwright tests in headless Chromium. Private repository",
    source: "Velvetclip master completion audit, 16 Nov 2026",
    lastVerified: "2026-11-19",
    evidenceUrl: "https://velvetclip.vercel.app",
  },
  {
    id: "velvetclip-tool-count",
    project: "velvetclip",
    claim: "Browser tools",
    value: "27",
    unit: " PDF, image, document, and media tools",
    status: "supported",
    method: "Tool registry in the audited build; the completion audit validated all 27 tools in Chromium, and each tool has its own route on the public deployment",
    source: "Velvetclip master completion audit, 16 Nov 2026",
    lastVerified: "2026-11-19",
    evidenceUrl: "https://velvetclip.vercel.app",
  },
  {
    id: "falsequiet-heldout-ddos",
    project: "falsequiet",
    claim: "Held-out attack detection",
    value: "71.1",
    unit: "% of 1,000 held-out DDoS flows flagged by the hybrid engine",
    status: "experimental",
    method: "DDoS excluded from supervised training on CIC-IDS2017 and replayed afterwards; a proxy for unseen attacks, not real-world zero-day validation",
    source: "FalseQuiet committed held-out experiment artifact",
    lastVerified: "2026-11-17",
    evidenceUrl: "https://github.com/yorayriniwnl/Hybrid-Intelligent-Network-Intrusion-Detection-System/blob/main/artifacts/results/heldout_experiment_results.json",
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
    source: "Zenith repository",
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
