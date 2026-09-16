export type ProjectMedia = {
  src: string;
  kind: "architecture" | "screen" | "mobile";
  width: number;
  height: number;
  label: string;
  alt: string;
  caption: string;
  sourceUrl: string;
};

export type ProjectMetric = {
  label: string;
  value: string;
  context: string;
};

export type ProjectDemoMode = "talks" | "helios" | "ai-vs-real" | "zenith";
export type ProjectLinkAvailability = "verified" | "unavailable" | "blocked";

export type Project = {
  id: string;
  slug: string;
  aliases: readonly string[];
  index: string;
  title: string;
  shortTitle?: string;
  kicker: string;
  purpose: string;
  status: string;
  role: string;
  contribution: string;
  collaborators?: string;
  outcome: string;
  evidenceScope: string;
  technologies: readonly string[];
  art: string;
  period: string;
  links: {
    live?: string;
    source?: string;
  };
  availability: {
    live: ProjectLinkAvailability;
    source: ProjectLinkAvailability;
  };
  visibility: {
    featured: boolean;
    portfolio: boolean;
    resume: boolean;
  };
  media: readonly ProjectMedia[];
  problem: string;
  whyItMatters: string;
  constraints: readonly string[];
  workflow: string;
  hardPart: string;
  decisions: readonly { title: string; body: string }[];
  architecture: readonly string[];
  implementation: readonly string[];
  testing: readonly string[];
  results: readonly string[];
  metrics: readonly ProjectMetric[];
  limitations: readonly string[];
  lessons: readonly string[];
  nextIteration: string;
  claimIds: readonly string[];
  demoMode?: ProjectDemoMode;
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
};

const portfolio: Project = {
  id: "portfolio",
  slug: "portfolio",
  aliases: [],
  index: "01",
  title: "Personal Developer Portfolio",
  shortTitle: "Portfolio",
  kicker: "Next.js product system",
  purpose: "A server-rendered engineering portfolio that turns project evidence into a fast, navigable case-study system.",
  status: "Active · deployed on Vercel",
  role: "Product engineer · architecture and implementation",
  contribution: "I designed and implemented the project registry, canonical route system, evidence presentation, and the rendering boundary around the existing interactive scenes.",
  collaborators: "Solo repository project.",
  outcome: "A maintainable recruiter surface with canonical case studies, stable source/live namespaces, and explicit evidence boundaries.",
  evidenceScope: "Repository evidence covers the Next.js App Router, TypeScript, the existing R3F/Three experience, and the project-system test contracts added here. The Vercel deployment was reachable during the 16 Sep 2026 deployment check; uptime and field performance are not inferred from that smoke check.",
  technologies: ["Next.js", "TypeScript", "React", "React Three Fiber", "Three.js", "CSS"],
  art: "/media/hero-studio.svg",
  period: "2026",
  links: {
    live: "https://yorayriniwnl.in",
    source: "https://github.com/yorayriniwnl/Portfolio-Ayush-Roy",
  },
  availability: { live: "verified", source: "verified" },
  visibility: { featured: true, portfolio: true, resume: true },
  media: [],
  problem: "A visually expressive portfolio still needs the same route ownership, evidence boundaries, and performance discipline as any other product surface.",
  whyItMatters: "Recruiters need a quick path to signal; engineers need a deeper path to the source, decisions, and limitations. Those paths should share one source of truth.",
  constraints: [
    "Project content must remain centralized and CV-scoped.",
    "Textual case studies should not pull the interactive 3D bundle into the initial render.",
    "The canonical host is configured explicitly so metadata remains on the intended public domain.",
  ],
  workflow: "A server-rendered project index leads to one canonical case study per project, with stable source and verified-live resolvers alongside the document.",
  hardPart: "The important boundary is separating the permanent professional namespace from changing infrastructure. A case study can remain stable even when a deployment or source provider changes.",
  decisions: [
    { title: "Keep project facts centralized", body: "The five public projects, aliases, links, availability, claims, and SEO copy live in the content model rather than being repeated across route components." },
    { title: "Make external destinations resolvers", body: "Live and source routes are data-driven redirects; the portfolio never embeds or proxies another application." },
    { title: "Defer heavy scenes", body: "The existing Three/R3F explanation loads only when its section approaches the viewport, keeping engineering text cheap to read." },
  ],
  architecture: ["Next.js App Router", "Central project registry", "Server-rendered case studies", "Stable live/source resolvers", "Deferred R3F scene boundary"],
  implementation: [
    "Canonical `/projects/[slug]` pages use static params and a shared case-study component.",
    "Alias and link resolution is pure data logic, with loopback and malformed URLs rejected.",
    "Metadata, sitemap, navigation, resume entries, and homepage cards consume the same CV registry.",
  ],
  testing: [
    "Node test contracts cover canonical lookup, aliases, legacy redirects, availability, and malformed destinations.",
    "Metadata and sitemap tests cover canonical origin and public-route scope.",
    "Typecheck, lint, content validation, asset validation, and production build remain release gates.",
  ],
  results: [
    "The public project index exposes exactly five CV projects.",
    "Source and live actions have explicit availability instead of guessed destinations.",
  ],
  metrics: [
    { label: "Public project scope", value: "5", context: "CV projects in the recruiter-facing index" },
    { label: "Rendering boundary", value: "Deferred", context: "R3F scene loads below the textual case-study surface" },
  ],
  limitations: [
    "The custom-domain deployment is verified at audit time; uptime and performance traces still need ongoing measurement.",
    "The interactive scene remains an explanatory visualization, not an application runtime or telemetry source.",
    "Performance results still need to be measured on the chosen production deployment.",
  ],
  lessons: [
    "A portfolio architecture should make uncertainty visible instead of hiding it behind visual polish.",
    "Stable internal paths are more durable than exposing infrastructure names in a CV.",
  ],
  nextIteration: "Measure the deployed case-study routes with real mobile performance traces, then add project-specific social-card artwork only if it improves sharing signal without increasing the critical path.",
  claimIds: ["portfolio-system"],
  seo: {
    title: "Personal Developer Portfolio · Engineering Case Study",
    description: "How Ayush Roy's Next.js and TypeScript portfolio centralizes project evidence, canonical routes, source resolvers, and deferred interactive rendering.",
    ogImage: "/media/hero-studio.svg",
  },
};

const helios: Project = {
  id: "helios",
  slug: "helios",
  aliases: ["yor-helios"],
  index: "02",
  title: "Yor Helios",
  kicker: "Realtime energy intelligence",
  purpose: "An experimental FastAPI/WebSocket system that moves energy signals through anomaly analysis into an operator-facing decision surface.",
  status: "Experimental · public frontend demo",
  role: "System concept · applied ML / realtime interface",
  contribution: "I shaped the operator-facing system concept and its signal-to-interpretation narrative; the repository remains the source for exact implementation ownership.",
  outcome: "A deterministic demonstration path for sample meter signals, anomaly state, alert handling, and operator interpretation.",
  evidenceScope: "The public URL deploys the repository's Next.js frontend demo. The FastAPI/WebSocket backend is not hosted by this deployment, and sample telemetry remains deterministic and illustrative; no field telemetry or latency result is claimed.",
  technologies: ["Python", "FastAPI", "WebSocket", "Anomaly detection", "Docker"],
  art: "/media/github/yor-helios/hero.svg",
  period: "2026",
  links: { live: "https://yor-helios-demo.vercel.app", source: "https://github.com/yorayriniwnl/Yor-Helios" },
  availability: { live: "verified", source: "verified" },
  visibility: { featured: true, portfolio: true, resume: true },
  media: [
    { src: "/media/github/yor-helios/architecture.svg", kind: "architecture", width: 1400, height: 720, label: "Signal path", alt: "Helios architecture diagram showing meter readings, FastAPI, anomaly logic, storage, and Next.js UI", caption: "The signal path keeps input, detection, storage, and operator surface visible.", sourceUrl: "https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/assets/architecture.svg" },
    { src: "/media/github/yor-helios/dashboard.svg", kind: "screen", width: 1200, height: 700, label: "Dashboard preview", alt: "Helios command center dashboard with signal overview, power trace, and live queue", caption: "A code-authored command surface for reading a synthetic signal window.", sourceUrl: "https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/dashboard.svg" },
    { src: "/media/github/yor-helios/alerts.svg", kind: "screen", width: 1000, height: 500, label: "Alert triage", alt: "Helios alert triage screen showing critical, high, and medium alert states", caption: "Severity carries meaning, while response actions stay explicit.", sourceUrl: "https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/alerts.svg" },
    { src: "/media/github/yor-helios/alert-detail.svg", kind: "screen", width: 1000, height: 600, label: "Alert detail", alt: "Helios high-power anomaly detail screen with decision context, response path, and evidence status", caption: "The detail state shows what an operator can decide and what evidence is still missing.", sourceUrl: "https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/alert-detail.svg" },
    { src: "/media/github/yor-helios/mobile-evidence.svg", kind: "mobile", width: 420, height: 720, label: "Mobile evidence", alt: "Helios mobile field capture screen with a signal preview, location, and field note", caption: "A mobile capture concept for attaching context to an alert.", sourceUrl: "https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/mobile-evidence.svg" },
  ],
  problem: "An anomaly score is not useful to an operator when the interface hides where the signal came from, what changed, and what action is plausible.",
  whyItMatters: "Operators need a traceable signal path before they can decide whether an anomaly deserves attention. A number without provenance creates alert fatigue instead of confidence.",
  constraints: [
    "Telemetry in the portfolio is illustrative, not field data.",
    "The demo must be repeatable without a live device or provider.",
    "The interface must explain the path from sample to operator view.",
  ],
  workflow: "A deterministic meter stream moves through the FastAPI/WebSocket analysis path and reveals an operator alert with enough context to inspect the event.",
  hardPart: "The meaningful design choice was to expose the route from meter to alert instead of hiding it behind a polished dashboard. That makes the demo slower to scan but easier to interrogate.",
  decisions: [
    { title: "Explain the signal path", body: "The UI pairs anomaly state with an explicit path from meter to analysis to operator view." },
    { title: "Keep the demo deterministic", body: "Fixed sample data makes screenshots and explanations reproducible without claiming live telemetry." },
    { title: "Separate concept from deployment", body: "Experimental repository behavior stays labeled as such rather than being upgraded into a production claim." },
  ],
  architecture: ["Meter / sample source", "FastAPI REST + WebSocket", "Anomaly analysis", "Storage boundary", "Operator surface"],
  implementation: [
    "FastAPI exposes the documented REST and WebSocket entry points.",
    "A deterministic simulator supplies repeatable signal frames for the demo path.",
    "Anomaly state is carried into alert handling so an operator can interpret the signal rather than only see a score.",
  ],
  testing: [
    "The repository includes backend pytest and CI paths around the service behavior.",
    "The portfolio presents the deterministic path as evidence; it does not claim field acceptance or measured delivery latency.",
  ],
  results: [
    "A repeatable signal → analysis → operator interpretation flow is documented.",
    "Alert states and response context remain visible in repository-backed screens.",
  ],
  metrics: [
    { label: "System type", value: "Realtime", context: "FastAPI + WebSocket path for signal updates" },
    { label: "Telemetry boundary", value: "Illustrative", context: "Deterministic sample data, not field telemetry" },
  ],
  limitations: [
    "Illustrative telemetry is not field telemetry.",
    "The portfolio does not simulate a production energy network.",
    "Performance claims require repository-specific measured evidence.",
    "The public Vercel surface is the frontend demo only; the backend and its realtime channel are not hosted there.",
  ],
  lessons: [
    "Operational ML needs context around the score.",
    "Reproducible demo states are better evidence than random dashboard motion.",
  ],
  nextIteration: "Connect a replayable fixture set to a measured ingestion path and document latency, reconnect, and alert-delivery behavior before claiming operational readiness.",
  claimIds: ["helios-deterministic-demo"],
  demoMode: "helios",
  seo: {
    title: "Yor Helios · Realtime Energy Intelligence Case Study",
    description: "A bounded engineering case study of Yor Helios: FastAPI, WebSocket signal flow, deterministic anomaly analysis, and operator interpretation.",
  },
};

const zenith: Project = {
  id: "zenith",
  slug: "zenith",
  aliases: ["yor-zenith"],
  index: "03",
  title: "Yor Zenith",
  kicker: "Solar planning / decision support",
  purpose: "An experimental solar decision-support experience connecting site and tariff inputs to visual scenarios and financial framing.",
  status: "Experimental · reachable at audit time",
  role: "Interface direction · product experience",
  contribution: "I contributed the interface direction and product experience: the sequence from site context to recommendation, scenario exploration, and financial framing.",
  collaborators: "Nivedana: architecture and full-stack development. Ayush Roy: interface direction and product experience.",
  outcome: "A product surface that makes rooftop potential, solar scenarios, and financial assumptions easier to inspect in sequence.",
  evidenceScope: "Repository-described experimental project. The hosted URL was reachable during the portfolio audit; production readiness, installer operations, and investment suitability are not claimed.",
  technologies: ["Next.js", "TypeScript", "Three.js", "Recharts", "Motion"],
  art: "/media/github/yor-zenith/hero.svg",
  period: "2026",
  links: {
    live: "https://zenith-xi-snowy.vercel.app",
    source: "https://github.com/yorayriniwnl/Yor-Zenith",
  },
  availability: { live: "verified", source: "verified" },
  visibility: { featured: true, portfolio: true, resume: true },
  media: [
    { src: "/media/github/yor-zenith/architecture.svg", kind: "architecture", width: 1200, height: 420, label: "Decision path", alt: "Zenith signal path diagram from bill and roof inputs through ROI model and policy layer to next check", caption: "Every output keeps its evidence boundary visible instead of hiding assumptions.", sourceUrl: "https://github.com/yorayriniwnl/Yor-Zenith/blob/58b2a256aa56c1eff202ef39ef5c7fa73bc2dea1/assets/architecture.svg" },
  ],
  problem: "Solar decisions mix physical constraints, price assumptions, and financial projections. A dashboard can become a spreadsheet wearing neon if those layers are not staged deliberately.",
  whyItMatters: "People making a solar decision need to understand which outputs come from the site, which come from assumptions, and which are scenarios. The interface should make that chain inspectable.",
  constraints: [
    "Rooftop geometry and financial assumptions are coupled.",
    "Scenario values are illustrative and must not read as investment advice.",
    "Team attribution has to remain explicit at the product boundary.",
  ],
  workflow: "The product moves from site context to recommended system scale, scenario economics, and longer-term potential while keeping assumptions visible.",
  hardPart: "The project needs a sequence through geometry, recommendation, and economics. Flattening those layers into one dashboard would hide assumptions and make the experience look more certain than the model is.",
  decisions: [
    { title: "Make scenarios legible", body: "Controls change bounded illustrative roof and solar states rather than implying a live engineering simulation." },
    { title: "Stage information density", body: "The experience moves from recommendation to financial detail instead of presenting every number at once." },
    { title: "Preserve team attribution", body: "The case study names Ayush's interface/product contribution and retains repository credit for architecture and development." },
  ],
  architecture: ["Site / bill / tariff inputs", "Recommendation model", "Financial scenario layer", "Visual decision surface"],
  implementation: [
    "The experience connects site context, rooftop/solar visualization, and scenario controls.",
    "Financial framing is shown as an assumption-bound scenario rather than a guaranteed return.",
    "The interface stages technical and financial density so a user can understand the decision path.",
  ],
  testing: [
    "Repository evidence supports the interface and scenario experience; this case study does not claim a production calculation audit.",
    "The next validation surface is the domain model: tariff assumptions, cash-flow equations, and multi-site boundaries.",
  ],
  results: [
    "Rooftop potential, scenario economics, and longer-term framing share one navigable product experience.",
    "Contribution boundaries remain visible instead of collapsing team work into a single-owner claim.",
  ],
  metrics: [
    { label: "Decision model", value: "Scenario-based", context: "Illustrative values with visible assumptions" },
    { label: "Ownership", value: "Shared", context: "Interface direction separated from architecture/full-stack credit" },
  ],
  limitations: [
    "Experimental project; outputs are not investment advice.",
    "Portfolio roof interaction and financial values are illustrative.",
    "No claim of guaranteed subsidies, physical survey accuracy, installer operations, or production readiness.",
  ],
  lessons: [
    "Complex interfaces need a sequence, not just more widgets.",
    "Good attribution is part of engineering credibility.",
  ],
  nextIteration: "Separate the domain calculations from the scene, then add tests for tariff assumptions, cash-flow equations, and multi-site scenario boundaries.",
  claimIds: ["zenith-interface-attribution"],
  demoMode: "zenith",
  seo: {
    title: "Yor Zenith · Solar Decision-Support Case Study",
    description: "How Yor Zenith frames solar planning through site inputs, visualization, bounded scenarios, financial assumptions, and explicit collaborator attribution.",
  },
};

const aiVsReal: Project = {
  id: "ai-vs-real",
  slug: "ai-vs-real",
  aliases: ["texture-forensics", "yor-ai-vs-real-image"],
  index: "04",
  title: "Yor AI vs. Real Image Detector",
  shortTitle: "AI vs. Real",
  kicker: "Texture Forensics / classical image forensics",
  purpose: "A classical computer-vision study that uses LBP and GLCM texture features with an SVM to classify AI-generated versus real imagery.",
  status: "Evaluated study · public inference demo",
  role: "Applied ML study · evaluation",
  contribution: "I built the interpretable preprocessing, texture-feature, classifier, and evaluation path represented by the repository, while keeping the result bounded to its documented holdout.",
  outcome: "78.5% accuracy on the repository's specific 107-image holdout.",
  evidenceScope: "The public URL runs the repository's Flask entrypoint with its checked-in SVM and scaler artifacts. The 78.5% result belongs to the repository's deterministic stratified 80/20 holdout with `random_state=42`; it is not a universal AI-image-detection accuracy claim.",
  technologies: ["Python", "OpenCV", "LBP", "GLCM", "RBF SVM"],
  art: "/media/github/texture-forensics/hero.svg",
  period: "2026",
  links: { live: "https://yor-ai-vs-real-detector.vercel.app", source: "https://github.com/yorayriniwnl/Yor-Ai-vs-real-image" },
  availability: { live: "verified", source: "verified" },
  visibility: { featured: true, portfolio: true, resume: true },
  media: [
    { src: "/media/github/texture-forensics/architecture.svg", kind: "architecture", width: 1500, height: 460, label: "Feature pipeline", alt: "Texture Forensics pipeline from image upload through texture extraction, classification, and verdict", caption: "The model story is visible from validated bytes to a dataset-bound verdict.", sourceUrl: "https://github.com/yorayriniwnl/Yor-Ai-vs-real-image/blob/42db86fbc1ddef360fba0366b49f18039b6dc4e9/assets/architecture.svg" },
  ],
  problem: "Synthetic-image cues change quickly, so a useful study must expose not just a headline score but also the feature representation and evaluation boundary.",
  whyItMatters: "Image-forensics results are easy to overstate when a small holdout is presented as a universal detector. Keeping the representation and split visible lets another engineer challenge the result.",
  constraints: [
    "The reported result belongs to a specific 107-image holdout.",
    "Texture features favor interpretability over end-to-end capacity.",
    "The browser walkthrough cannot substitute for a fresh evaluation.",
  ],
  workflow: "Images are converted to grayscale and resized, texture descriptors are extracted, and an RBF SVM produces a verdict within the fixed evaluation boundary.",
  hardPart: "The methodology had to keep the dataset boundary beside the score. A higher headline number would be less useful if the split or feature path could not be reproduced.",
  decisions: [
    { title: "Use interpretable texture families", body: "LBP and GLCM make the feature story inspectable instead of hiding every decision inside an opaque end-to-end model." },
    { title: "Keep context beside the score", body: "The 78.5% result is always paired with the 107-image holdout boundary." },
    { title: "Precompute browser examples", body: "The portfolio reveals fixed feature views without uploading visitor images or invoking an inference service." },
  ],
  architecture: ["Grayscale / resize", "LBP + GLCM extraction", "17-value feature vector", "Scaler + RBF SVM", "107-image holdout"],
  implementation: [
    "Inputs are grayscale-converted and resized to 224 × 224 before feature extraction.",
    "LBP and GLCM features form the documented 17-value representation.",
    "A scaler and RBF SVM carry the feature vector through inference and evaluation.",
  ],
  testing: [
    "The repository evaluation uses a deterministic stratified 80/20 split with `random_state=42`.",
    "The supported sample boundary is 533 images: 426 training examples and a 107-image holdout.",
    "The portfolio does not present its explanatory interaction as a live inference endpoint.",
  ],
  results: [
    "78.5% accuracy on the documented 107-image holdout.",
    "The result is paired with the feature method, split boundary, and limitations so it can be evaluated honestly.",
  ],
  metrics: [
    { label: "Holdout accuracy", value: "78.5%", context: "107-image holdout; repository-stated evaluation" },
    { label: "Feature representation", value: "17 values", context: "LBP + GLCM texture features" },
  ],
  limitations: [
    "The holdout is small relative to the breadth of image generators and styles.",
    "No claim of robustness to unseen generators, manipulation, or distribution shift.",
    "The portfolio interaction is explanatory, not live inference.",
    "The public Vercel surface is a bounded demo, not an operational detection service or a universal authenticity guarantee.",
  ],
  lessons: [
    "A metric without its dataset boundary is decoration.",
    "Classical features can be valuable when interpretability is part of the product story.",
  ],
  nextIteration: "Publish the dataset manifest, class balance, fixed seed, confusion matrix, and a fresh held-out evaluation before comparing against newer generators.",
  claimIds: ["texture-holdout-accuracy"],
  demoMode: "ai-vs-real",
  seo: {
    title: "Yor AI vs. Real Image Detector · Texture Forensics",
    description: "A bounded classical computer-vision case study using grayscale preprocessing, LBP, GLCM, and an RBF SVM evaluated on a 107-image holdout.",
  },
};

const talks: Project = {
  id: "talks",
  slug: "talks",
  aliases: ["yor-talks", "yor-talks-v2"],
  index: "05",
  title: "Yor Talks V2",
  shortTitle: "Talks V2",
  kicker: "Realtime social systems",
  purpose: "A full-stack social product system built around authenticated conversations, durable persistence, and realtime message delivery.",
  status: "Code-ready · deployment blocked",
  role: "Full-stack product engineering",
  contribution: "The case study frames the repository's current system boundaries, realtime permissions, persistence model, and readiness evidence. Repository history includes additional contributors; subsystem-level ownership should be read from the source.",
  outcome: "A bounded beta path with local regression/build evidence and explicit production release gates.",
  evidenceScope: "Repository readiness audit dated 31 Aug 2026. This is not a verified public service. The case study uses the repository's current React/Vite + Express/Socket.IO stack; older resume wording is not carried forward.",
  technologies: ["React", "Vite", "Express 5", "Socket.IO", "PostgreSQL", "Drizzle", "Redis"],
  art: "/media/github/yor-talks/hero.svg",
  period: "2026",
  links: { source: "https://github.com/yorayriniwnl/yor-talksv2" },
  availability: { live: "blocked", source: "verified" },
  visibility: { featured: true, portfolio: true, resume: true },
  media: [
    { src: "/media/github/yor-talks/architecture.svg", kind: "architecture", width: 1600, height: 650, label: "Repository architecture", alt: "Yor Talks architecture diagram showing client, Express, PostgreSQL, Redis, and gated providers", caption: "The repository's verified code path: one social surface with explicit boundaries.", sourceUrl: "https://github.com/yorayriniwnl/yor-talksv2/blob/3aad91ce46059bb47749a0d5598140cd8cb91099/assets/architecture.svg" },
  ],
  problem: "Social products become brittle when identity, audience controls, realtime state, and provider integrations are treated as isolated screens instead of one system.",
  whyItMatters: "A person can lose trust in a social product through one unauthorized event, stale notification, or silently dropped message. The system has to keep identity, durable state, and realtime delivery aligned.",
  constraints: [
    "Realtime authorization must stay server-owned.",
    "PostgreSQL and Redis have different durability responsibilities.",
    "Provider credentials and hosted acceptance are unavailable for this portfolio.",
  ],
  workflow: "The core path keeps the React/Vite shell, Express authorization, durable PostgreSQL state, Socket.IO events, and Redis worker paths explicit so optional providers can fail closed.",
  hardPart: "The difficult boundary is deciding what the browser may request versus what the server must prove. Treating Socket.IO as a second trusted API would make the happy path simpler and the failure path unsafe.",
  decisions: [
    { title: "Keep realtime gates server-owned", body: "Socket.IO events pass through authentication and authorization boundaries rather than becoming a second ungoverned API." },
    { title: "Bound the beta honestly", body: "Provider-backed features remain gated until credentials and live acceptance checks exist. Local readiness is not presented as public deployment." },
    { title: "Separate durable and ephemeral work", body: "PostgreSQL owns product state while Redis owns queues, notifications, and readiness-sensitive worker paths." },
  ],
  architecture: ["React + Vite client", "Express 5 REST + Socket.IO", "PostgreSQL + Drizzle", "Redis queues / workers", "Gated providers"],
  implementation: [
    "Authentication and authorization sit at the API and Socket.IO boundaries.",
    "Conversations and messages use PostgreSQL/Drizzle for durable product state.",
    "Redis carries transient queues and notification work without becoming the source of truth.",
  ],
  testing: [
    "The repository readiness audit records 61/61 API tests, 17/17 root checks, and 17/17 Chromium E2E checks for the exercised paths.",
    "Those passing local checks do not verify a public deployment, TLS, monitoring, provider credentials, or restore drills.",
  ],
  results: [
    "The current repository exposes a coherent authentication → authorization → persistence → realtime flow.",
    "Release gates remain explicit where live infrastructure evidence is missing.",
  ],
  metrics: [
    { label: "API checks", value: "61/61", context: "Repository readiness audit; local exercised paths" },
    { label: "Chromium E2E", value: "17/17", context: "Repository readiness audit; not public deployment evidence" },
  ],
  limitations: [
    "Public deployment is not verified; the repository marks deployment as blocked.",
    "Live provider credentials, TLS, monitoring, and restore checks remain release gates.",
    "Local test totals are evidence of exercised paths, not a production-readiness guarantee.",
  ],
  lessons: [
    "A realtime feature is only as trustworthy as its authorization path.",
    "Readiness reports should describe what was actually exercised, not what a diagram implies.",
  ],
  nextIteration: "Run the full provider-backed acceptance path in a controlled preview, then add failure injection around reconnects, queue retries, and restore drills.",
  claimIds: ["talks-realtime-stack", "talks-release-boundary"],
  demoMode: "talks",
  seo: {
    title: "Yor Talks V2 · Realtime Social Systems Case Study",
    description: "A current-stack case study of Yor Talks V2: React/Vite, Express, Socket.IO, PostgreSQL, Drizzle, Redis, authentication, and server-owned realtime permissions.",
  },
};

const tokenUsage: Project = {
  id: "token-usage",
  slug: "token-usage",
  aliases: [],
  index: "legacy",
  title: "Yor Token Usage",
  kicker: "Compatibility-only record",
  purpose: "A developer-facing tool for making token-use estimates and session breakdowns easier to inspect.",
  status: "Additional work · legacy route only",
  role: "Developer tooling",
  contribution: "Retained as compatibility data only; it is not part of the recruiter-facing project system.",
  outcome: "A compact local workflow for inspecting estimated usage with explicit method limits.",
  evidenceScope: "Token counts are estimates. This record is retained to avoid deleting useful historical content and is not exposed in the new public index.",
  technologies: ["TypeScript", "Developer tooling", "Local analysis"],
  art: "/media/token.svg",
  period: "2026",
  links: { source: "https://github.com/yorayriniwnl/Yor_Token_Usage" },
  availability: { live: "unavailable", source: "verified" },
  visibility: { featured: false, portfolio: false, resume: false },
  media: [],
  problem: "Usage dashboards become misleading when estimates, provider billing, and local counts are visually blended into one authoritative number.",
  whyItMatters: "Developers need to know whether a number describes a local estimate or a provider invoice.",
  constraints: ["Counts are estimates and can diverge from provider billing.", "The useful path must work locally without cloud credentials."],
  workflow: "A sample session is split into understandable segments and each segment reveals how the estimate was derived.",
  hardPart: "The hard part is resisting a single authoritative total. Showing the method beside each estimate keeps the tool useful without implying billing accuracy.",
  decisions: [
    { title: "Label estimates as estimates", body: "The interface avoids turning approximate counts into provider billing claims." },
    { title: "Keep the local path useful", body: "The case study emphasizes behavior that exists without requiring cloud integrations." },
  ],
  architecture: ["Session input", "Local estimation", "Breakdown / method details"],
  implementation: ["Local estimation and method details remain separate from provider billing."],
  testing: ["Retained historical evidence; no new recruiter-facing claim is made."],
  results: ["Historical content remains available to its compatibility route."],
  metrics: [],
  limitations: ["Estimates can diverge from provider billing.", "Cloud/provider integrations require separate evidence."],
  lessons: ["Method transparency matters more than dashboard precision theater."],
  nextIteration: "Add provider-specific calibration fixtures and compare them against documented invoices before exposing any cloud-backed totals.",
  claimIds: ["token-usage-estimates"],
  seo: {
    title: "Yor Token Usage · Legacy Project Record",
    description: "Compatibility-only historical project record for Yor Token Usage.",
  },
};

export const CANONICAL_PROJECT_SLUGS = ["portfolio", "helios", "zenith", "ai-vs-real", "talks"] as const;

export const cvProjects: readonly Project[] = [portfolio, helios, zenith, aiVsReal, talks];
export const legacyProjects: readonly Project[] = [tokenUsage];
export const allProjects: readonly Project[] = [...cvProjects, ...legacyProjects];

// Kept as a compatibility export for older integrations. New public surfaces must use cvProjects.
export const featuredProjects = cvProjects.filter((project) => project.visibility.featured);
