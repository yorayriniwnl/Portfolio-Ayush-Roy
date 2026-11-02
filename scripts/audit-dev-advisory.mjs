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
/**
 * GHSA-g3hv-75wg-m249 describes the firstPhasePreProcess globparts amplifier
 * present in minimatch 10.2.6. The upstream minimatch 3.1.5 implementation
 * (v3.1.5/minimatch.js) does not contain that code path. Its historical
 * CommonJS callable API is required by ESLint 9's pinned consumers; forcing
 * a root-level v11 override would break those interfaces.
 *
 * Keep this narrowly confined to the exact installed legacy 3.1.5 build in
 * development-only tooling. The modern TypeScript parser instance MUST have
 * been upgraded to the patched 11.0.1 release. Any changed version, new
 * advisory, non-dev path or unexpected ancestor fails the security gate.
 *
 * Scope issue: https://github.com/github/advisory-database/issues/10811
 * Upstream v3: https://github.com/isaacs/minimatch/blob/v3.1.5/minimatch.js
 */
const legacyMinimatchAdvisory = "GHSA-g3hv-75wg-m249";
const legacyMinimatchDevChain = new Set([
  "minimatch",
  "eslint",
  "eslint-config-next",
  "@eslint-community/eslint-utils",
  "@eslint/config-array",
  "@eslint/eslintrc",
  "@next/eslint-plugin-next",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "@typescript-eslint/type-utils",
  "@typescript-eslint/typescript-estree",
  "@typescript-eslint/utils",
  "typescript-eslint",
  "eslint-plugin-import",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-react",
]);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const names = lock.packages ?? {};
const legacyMinimatch = names["node_modules/minimatch"];
const fixedModernMinimatch = names["node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch"];
const legacyVersionIsKnown =
  legacyMinimatch?.version === "3.1.5" &&
  legacyMinimatch?.dev === true &&
  fixedModernMinimatch?.version === "11.0.1" &&
  fixedModernMinimatch?.dev === true;

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
  const legacyFalsePositive =
    legacyVersionIsKnown &&
    legacyMinimatchDevChain.has(name) &&
    pkg?.dev === true &&
    Array.isArray(v.via) &&
    v.via.length > 0 &&
    v.via.every((entry) =>
      typeof entry === "string"
        ? legacyMinimatchDevChain.has(entry)
        : entry?.url === "https://github.com/advisories/" + legacyMinimatchAdvisory
    );
  if (chainOnly || legacyFalsePositive) allowed.push(name);
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
