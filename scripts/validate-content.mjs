import fs from "node:fs";
for(const f of ["src/content/profile.ts","src/content/projects.ts","src/content/claims.ts"])if(!fs.existsSync(f))throw new Error(`Missing ${f}`);
const content=fs.readFileSync("src/content/projects.ts","utf8");
const claims=fs.readFileSync("src/content/claims.ts","utf8");
for(const slug of ["yor-talks","helios","texture-forensics","zenith","token-usage"])if(!content.includes(`slug:"${slug}"`))throw new Error(`Missing project ${slug}`);
for(const id of ["talks-realtime-stack","talks-release-boundary","helios-deterministic-demo","texture-holdout-accuracy","zenith-interface-attribution","token-usage-estimates"])if(!claims.includes(`id: "${id}"`))throw new Error(`Missing claim ${id}`);
for(const route of ["src/app/page.tsx","src/app/resume/page.tsx","src/app/work/[slug]/page.tsx","src/app/not-found.tsx"])if(!fs.existsSync(route))throw new Error(`Missing route ${route}`);
if(!content.includes("78.5% accuracy on a specific 107-image holdout"))throw new Error("Texture Forensics metric boundary missing");
if(!content.includes("deployment blocked"))throw new Error("Talks readiness boundary missing");
if(!content.includes("Architecture / development credited in the repository to Nivedana"))throw new Error("Zenith collaborator attribution missing");
if(!fs.readFileSync("src/content/profile.ts","utf8").includes("headline: \"Product / Full-Stack Engineer\""))throw new Error("Primary positioning missing");
for(const asset of [
  "/media/github/yor-talks/hero.svg","/media/github/yor-talks/architecture.svg",
  "/media/github/yor-helios/hero.svg","/media/github/yor-helios/architecture.svg","/media/github/yor-helios/dashboard.svg","/media/github/yor-helios/alerts.svg","/media/github/yor-helios/alert-detail.svg","/media/github/yor-helios/mobile-evidence.svg",
  "/media/github/texture-forensics/hero.svg","/media/github/texture-forensics/architecture.svg",
  "/media/github/yor-zenith/hero.svg","/media/github/yor-zenith/architecture.svg"
])if(!fs.existsSync(`public${asset}`))throw new Error(`Missing repository visual ${asset}`);
for(const marker of ["Source visuals / repository assets","View source asset ↗","3aad91ce46059bb47749a0d5598140cd8cb91099","a99e15056eadb5252bf299c62e8af5844d543d4c","42db86fbc1ddef360fba0366b49f18039b6dc4e9","58b2a256aa56c1eff202ef39ef5c7fa73bc2dea1"])if(!fs.readFileSync("src/components/ProjectGallery.tsx","utf8").includes(marker)&&!content.includes(marker))throw new Error(`Repository visual marker missing ${marker}`);
console.log("content validation: passed");
