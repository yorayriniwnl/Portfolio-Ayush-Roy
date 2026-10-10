import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

/**
 * A risk-reviewed, tightly scoped exception for an upstream advisory that
 * currently has no patched release (GHSA-vfj7-8cjw-p6xm).
 *
 * This project does not accept untrusted glob patterns into ESLint or its
 * transitive fast-glob/micromatch/braces development toolchain.
 * Never broaden this list to hide unrelated vulnerabilities.
 */
const allowedChain = new Set([
  "braces",
  "micromatch",
  "fast-glob",
  "@next/eslint-plugin-next",
  "eslint-config-next",
]);
const advisory = "GHSA-vfj7-8cjw-p6xm";
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const names = lock.packages ?? {};

const npm = spawnSync("npm", ["audit", "--json", "--audit-level=high"], {
  encoding: "utf8",
  timeout: 120000,
  maxBuffer: 20 * 1024 * 1024,
});
if (npm.error) throw npm.error;
let report;
try { report = JSON.parse(npm.stdout); }
catch {
  console.error(npm.stderr || npm.stdout || "Could not parse npm audit JSON");
  process.exit(1);
}
if (report.error) {
  console.error("npm audit failed to query advisory database", report.error);
  process.exit(1);
}
const vulnerabilities = report.vulnerabilities ?? {};
const unexpected = [];
const allowed = [];
for (const [name, v] of Object.entries(vulnerabilities)) {
  if (!["moderate", "high", "critical"].includes(v.severity)) continue;
  const pkg = names[`node_modules/${name}`];
  const chainOnly =
    allowedChain.has(name) &&
    pkg?.dev === true &&
    Array.isArray(v.via) &&
    v.via.length > 0 &&
    v.via.every((entry) =>
      typeof entry === "string"
        ? allowedChain.has(entry)
        : entry?.url === `https://github.com/advisories/${advisory}`
    );
  if (chainOnly) allowed.push(name);
  else unexpected.push({ name, severity: v.severity, via: v.via });
}
if (unexpected.length) {
  console.error("Unexpected moderate/high/critical vulnerability; release blocked.");
  console.error(JSON.stringify(unexpected, null, 2));
  process.exit(1);
}
if (allowed.length) {
  console.warn(
    `Risk-accepted development-tooling-only advisory ${advisory}: ${allowed.join(", ")}. ` +
    "No upstream patch is available. Re-review on each release."
  );
}
console.log("Dependency audit passed: no unexpected moderate, high or critical advisories.");
