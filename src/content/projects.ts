export type ProjectMedia = {
  src:string; kind:"architecture"|"screen"|"mobile"; width:number; height:number;
  label:string; alt:string; caption:string; sourceUrl:string;
};

export type Project = {
  slug:string; index:string; title:string; kicker:string; purpose:string; status:string; role:string; outcome:string; evidenceScope:string;
  technologies:readonly string[]; art:string; repo:string; period:string; collaborators?:string; featured:boolean; media:readonly ProjectMedia[];
  problem:string; whyItMatters:string; constraints:readonly string[]; workflow:string; hardPart:string; decisions:readonly {title:string;body:string}[]; architecture:readonly string[]; limitations:readonly string[]; lessons:readonly string[]; nextIteration:string; claimIds:readonly string[];
};

export const projects:readonly Project[]=[
{
 slug:"yor-talks",index:"01",title:"Yor Talks",kicker:"Realtime social systems",
 purpose:"A full-stack social product prototype for identity, conversation, communities, stories, live surfaces and creator tools.",
 status:"Code-ready · deployment blocked",role:"Full-stack product engineering",
 outcome:"A bounded beta path with local regression/build evidence and explicit production release gates.",
 evidenceScope:"Repository readiness audit dated 31 Aug 2026. This is not a verified public service.",
 technologies:["React","Vite","Express 5","Socket.IO","PostgreSQL","Drizzle","Redis"],art:"/media/github/yor-talks/hero.svg",repo:"https://github.com/yorayriniwnl/yor-talksv2",period:"2026",featured:true,
 media:[
  {src:"/media/github/yor-talks/architecture.svg",kind:"architecture",width:1600,height:650,label:"Repository architecture",alt:"Yor Talks architecture diagram showing client, Express, PostgreSQL, Redis, and gated providers",caption:"The repository's verified code path: one social surface with explicit boundaries.",sourceUrl:"https://github.com/yorayriniwnl/yor-talksv2/blob/3aad91ce46059bb47749a0d5598140cd8cb91099/assets/architecture.svg"}
 ],
 problem:"Social products become brittle when identity, audience controls, realtime state and provider integrations are treated as isolated screens instead of one system.",
 whyItMatters:"A person can lose trust in a social product through one unauthorized event, stale notification, or silently dropped message. The system has to keep identity, durable state, and realtime delivery aligned.",
 constraints:["Realtime authorization must stay server-owned.","PostgreSQL and Redis have different durability responsibilities.","Provider credentials and hosted acceptance are unavailable for this portfolio."],
 workflow:"The core path keeps the browser social shell, API authorization, durable Postgres state, realtime Socket.IO events and Redis worker paths explicit so optional providers can fail closed.",
 hardPart:"The difficult boundary is deciding what the browser may request versus what the server must prove. Treating Socket.IO as a second trusted API would have made the happy path simpler and the failure path unsafe.",
 decisions:[
  {title:"Keep realtime gates server-owned",body:"Socket.IO events pass through authentication and authorization boundaries rather than becoming a second ungoverned API."},
  {title:"Bound the beta honestly",body:"Provider-backed features remain gated until credentials and live acceptance checks exist. Local readiness is not presented as public deployment."},
  {title:"Separate durable and ephemeral work",body:"Postgres owns product state while Redis owns queues, notifications and readiness-sensitive worker paths."}
 ],architecture:["React + Vite client","Express 5 REST + Socket.IO","PostgreSQL + Drizzle","Redis workers","Gated providers"],
 limitations:["Public deployment is not verified.","Live provider, TLS, monitoring and restore checks remain release gates.","Portfolio demo data is deterministic and illustrative."],
 lessons:["A realtime feature is only as trustworthy as its authorization path.","Readiness reports should describe what was actually exercised, not what a diagram implies."],
 nextIteration:"Run the full provider-backed acceptance path in a controlled preview, then add failure injection around reconnects, queue retries, and restore drills.",
 claimIds:["talks-realtime-stack","talks-release-boundary"]
},
{
 slug:"helios",index:"02",title:"Yor Helios",kicker:"Energy intelligence",
 purpose:"An experimental operator-facing energy intelligence system that makes anomaly signals legible without pretending illustrative telemetry is production data.",
 status:"Experimental · deterministic demo",role:"System concept · applied ML / realtime interface",
 outcome:"A deterministic demonstration path for meter signals, anomaly state and operator interpretation.",
 evidenceScope:"Repository-described experimental behavior. Sample telemetry remains illustrative.",
 technologies:["Python","FastAPI","WebSocket","Anomaly detection","Docker"],art:"/media/github/yor-helios/hero.svg",repo:"https://github.com/yorayriniwnl/Yor-Helios",period:"2026",featured:true,
 media:[
  {src:"/media/github/yor-helios/architecture.svg",kind:"architecture",width:1400,height:720,label:"Signal path",alt:"Helios architecture diagram showing meter readings, FastAPI, anomaly logic, storage, and Next.js UI",caption:"The signal path keeps input, detection, storage, and operator surface visible.",sourceUrl:"https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/assets/architecture.svg"},
  {src:"/media/github/yor-helios/dashboard.svg",kind:"screen",width:1200,height:700,label:"Dashboard preview",alt:"Helios command center dashboard with signal overview, power trace, and live queue",caption:"A code-authored command surface for reading a synthetic signal window.",sourceUrl:"https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/dashboard.svg"},
  {src:"/media/github/yor-helios/alerts.svg",kind:"screen",width:1000,height:500,label:"Alert triage",alt:"Helios alert triage screen showing critical, high, and medium alert states",caption:"Severity carries meaning, while response actions stay explicit.",sourceUrl:"https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/alerts.svg"},
  {src:"/media/github/yor-helios/alert-detail.svg",kind:"screen",width:1000,height:600,label:"Alert detail",alt:"Helios high-power anomaly detail screen with decision context, response path, and evidence status",caption:"The detail state shows what an operator can decide and what evidence is still missing.",sourceUrl:"https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/alert-detail.svg"},
  {src:"/media/github/yor-helios/mobile-evidence.svg",kind:"mobile",width:420,height:720,label:"Mobile evidence",alt:"Helios mobile field capture screen with a signal preview, location, and field note",caption:"A mobile capture concept for attaching context to an alert.",sourceUrl:"https://github.com/yorayriniwnl/Yor-Helios/blob/a99e15056eadb5252bf299c62e8af5844d543d4c/docs/screenshots/mobile-evidence.svg"}
 ],
 problem:"An anomaly score is not useful to an operator when the interface hides where the signal came from, what changed, and what action is plausible.",
 whyItMatters:"Operators need a traceable signal path before they can decide whether an anomaly deserves attention. A number without provenance creates alert fatigue instead of confidence.",
 constraints:["Telemetry in the portfolio is illustrative, not field data.","The demo must be repeatable without a live device or provider.","The interface must explain the path from sample to operator view."],
 workflow:"A deterministic meter stream moves through an analysis path and reveals an operator alert with enough context to inspect the event.",
 hardPart:"The meaningful design choice was to expose the route from meter to alert instead of hiding it behind a polished dashboard. That makes the demo slower to scan but much easier to interrogate.",
 decisions:[
  {title:"Explain the signal path",body:"The UI pairs anomaly state with an explicit path from meter to analysis to operator view."},
  {title:"Keep the demo deterministic",body:"Portfolio interactions use fixed sample data, making screenshots and explanations reproducible."},
  {title:"Separate concept from deployment",body:"Experimental repository behavior stays labeled as such rather than upgraded into a production claim."}
 ],architecture:["Meter / sample source","Realtime API / WebSocket","Anomaly logic","Operator surface"],
 limitations:["Illustrative telemetry is not field telemetry.","The portfolio does not simulate a production energy network.","Performance claims require repository-specific measured evidence."],
 lessons:["Operational ML needs context around the score.","Reproducible demo states are better evidence than random dashboard motion."],
 nextIteration:"Connect a replayable fixture set to a measured ingestion path and document latency, reconnect, and alert-delivery behavior before claiming operational readiness.",
 claimIds:["helios-deterministic-demo"]
},
{
 slug:"texture-forensics",index:"03",title:"Texture Forensics",kicker:"Applied computer vision",
 purpose:"A classical image-forensics study using texture features to classify AI-generated versus real imagery.",
 status:"Evaluated study",role:"Applied ML study · evaluation",outcome:"78.5% accuracy on a specific 107-image holdout.",
 evidenceScope:"The result belongs to the repository's stated 107-image holdout and must not be generalized beyond that evaluation.",
 technologies:["Python","OpenCV","LBP","GLCM","SVM"],art:"/media/github/texture-forensics/hero.svg",repo:"https://github.com/yorayriniwnl/Yor-Ai-vs-real-image",period:"2026",featured:true,
 media:[
  {src:"/media/github/texture-forensics/architecture.svg",kind:"architecture",width:1500,height:460,label:"Feature pipeline",alt:"Texture Forensics pipeline from image upload through texture extraction, classification, and verdict",caption:"The model story is visible from validated bytes to a dataset-bound verdict.",sourceUrl:"https://github.com/yorayriniwnl/Yor-Ai-vs-real-image/blob/42db86fbc1ddef360fba0366b49f18039b6dc4e9/assets/architecture.svg"}
 ],
 problem:"Synthetic-image cues change quickly, so a useful study must expose not just a headline score but also the feature representation and evaluation boundary.",
 whyItMatters:"Image-forensics results are easy to overstate when a small holdout is presented as a universal detector. Keeping the representation and split visible lets another engineer challenge the result.",
 constraints:["The reported result belongs to a specific 107-image holdout.","Texture features favor interpretability over end-to-end capacity.","The browser walkthrough cannot substitute for a fresh evaluation."],
 workflow:"Images are transformed into texture descriptors, inspected through precomputed feature views, and classified with a traditional ML pipeline.",
 hardPart:"The methodology had to keep the dataset boundary beside the score. A higher headline number would be less useful if the split or feature path could not be reproduced.",
 decisions:[
  {title:"Use interpretable texture families",body:"LBP and GLCM make the feature story inspectable instead of hiding every decision inside an opaque end-to-end model."},
  {title:"Keep context beside the score",body:"The 78.5% result is always paired with the 107-image holdout boundary."},
  {title:"Precompute browser examples",body:"The portfolio reveals fixed feature views without uploading visitor images or invoking an inference service."}
 ],architecture:["Image preprocessing","LBP / GLCM features","Feature vector","SVM classifier","Holdout evaluation"],
 limitations:["Small holdout.","No claim of robustness to unseen generators or distribution shift.","Portfolio interaction is explanatory, not live inference."],
 lessons:["A metric without its dataset boundary is decoration.","Classical features can be valuable when interpretability is part of the product story."],
 nextIteration:"Publish the dataset manifest, class balance, fixed seed, confusion matrix, and a fresh held-out evaluation before comparing against newer generators.",
 claimIds:["texture-holdout-accuracy"]
},
{
 slug:"zenith",index:"04",title:"Yor Zenith",kicker:"Solar interface systems",
 purpose:"An experimental solar intelligence interface for turning technical rooftop and investment signals into a navigable product experience.",
 status:"Experimental",role:"Interface direction · product experience",collaborators:"Architecture / development credited in the repository to Nivedana.",
 outcome:"A product experience connecting rooftop potential, financial framing and scenario exploration.",
 evidenceScope:"Repository attribution is preserved. Broader architecture/development ownership is not claimed.",
 technologies:["Next.js","TypeScript","Three.js","Recharts","Motion"],art:"/media/github/yor-zenith/hero.svg",repo:"https://github.com/yorayriniwnl/Yor-Zenith",period:"2026",featured:true,
 media:[
  {src:"/media/github/yor-zenith/architecture.svg",kind:"architecture",width:1200,height:420,label:"Decision path",alt:"Zenith signal path diagram from bill and roof inputs through ROI model and policy layer to next check",caption:"Every output keeps its evidence boundary visible instead of hiding assumptions.",sourceUrl:"https://github.com/yorayriniwnl/Yor-Zenith/blob/58b2a256aa56c1eff202ef39ef5c7fa73bc2dea1/assets/architecture.svg"}
 ],
 problem:"Solar decisions mix physical constraints, price assumptions and financial projections. A dashboard can become a spreadsheet wearing neon if those layers are not staged deliberately.",
 whyItMatters:"People making a solar decision need to understand which outputs come from the site, which come from assumptions, and which are scenarios. The interface should make that chain inspectable.",
 constraints:["Rooftop geometry and financial assumptions are coupled.","Scenario values are illustrative and must not read as investment advice.","Team attribution has to remain explicit at the product boundary."],
 workflow:"The product moves from site context to recommended system scale, scenario economics and longer-term potential while keeping assumptions visible.",
 hardPart:"The project needs a sequence through geometry, recommendation, and economics. Flattening those layers into one dashboard would hide assumptions and make the experience look more certain than the model is.",
 decisions:[
  {title:"Make scenarios legible",body:"Controls change bounded illustrative roof/solar states rather than implying a live engineering simulation."},
  {title:"Stage information density",body:"The experience moves from recommendation to financial detail instead of presenting every number at once."},
  {title:"Preserve team attribution",body:"The case study describes Ayush's interface/product contribution and retains repository credit for architecture/development."}
 ],architecture:["Site / tariff inputs","Recommendation model","Financial scenario layer","Product interface"],
 limitations:["Experimental project.","Portfolio roof interaction is illustrative.","Financial outputs depend on model assumptions and are not investment advice."],
 lessons:["Complex interfaces need a sequence, not just more widgets.","Good attribution is part of engineering credibility."],
 nextIteration:"Separate the domain calculations from the scene, then add tests for tariff assumptions, cash-flow equations, and multi-site scenario boundaries.",
 claimIds:["zenith-interface-attribution"]
},
{
 slug:"token-usage",index:"05",title:"Yor Token Usage",kicker:"Developer tooling",
 purpose:"A developer-facing tool for making token-use estimates and session breakdowns easier to inspect.",
 status:"Additional work",role:"Developer tooling",outcome:"A compact local workflow for inspecting estimated usage with explicit method limits.",
 evidenceScope:"Token counts are estimates. Implemented local behavior is separated from provider/cloud integration ideas.",
 technologies:["TypeScript","Developer tooling","Local analysis"],art:"/media/token.svg",repo:"https://github.com/yorayriniwnl/Yor_Token_Usage",period:"2026",featured:false,media:[],
 problem:"Usage dashboards become misleading when estimates, provider billing and local counts are visually blended into one authoritative number.",
 whyItMatters:"Developers need to know whether a number describes a local estimate or a provider invoice. Clear measurement boundaries prevent false precision from driving cost decisions.",
 constraints:["Counts are estimates and can diverge from provider billing.","The useful path must work locally without cloud credentials."],
 workflow:"A sample session is split into understandable segments and each segment reveals how the estimate was derived.",
 hardPart:"The hard part is resisting a single authoritative total. Showing the method beside each estimate keeps the tool useful without implying billing accuracy.",
 decisions:[
  {title:"Label estimates as estimates",body:"The interface avoids turning approximate counts into provider billing claims."},
  {title:"Keep the local path useful",body:"The case study emphasizes behavior that exists without requiring cloud integrations."}
 ],architecture:["Session input","Local estimation","Breakdown / method details"],
 limitations:["Estimates can diverge from provider billing.","Cloud/provider integrations require separate evidence."],
 lessons:["Method transparency matters more than dashboard precision theater."],
 nextIteration:"Add provider-specific calibration fixtures and compare them against documented invoices before exposing any cloud-backed totals.",
 claimIds:["token-usage-estimates"]
}
];
export const featuredProjects=projects.filter(p=>p.featured);
export const getProject=(slug:string)=>projects.find(p=>p.slug===slug);
