import type { Project } from "./projects";

const repository = "https://github.com/yorayriniwnl/Hybrid-Intelligent-Network-Intrusion-Detection-System";

export const falseQuietProject: Project = {
  id: "falsequiet",
  slug: "falsequiet",
  aliases: ["h-nids", "hybrid-nids", "hybrid-intelligent-nids"],
  index: "04",
  title: "FalseQuiet",
  shortTitle: "FalseQuiet",
  kicker: "Hybrid network intrusion detection",
  purpose: "A machine-learning network intrusion detection prototype that pairs supervised classifiers for known attacks with an anomaly detector for attack types it was never trained on, and explains each verdict.",
  status: "Research prototype · source + live",
  role: "Applied ML · security research",
  contribution: "I developed the FalseQuiet prototype represented by the repository: data preparation, the XGBoost, TabTransformer, and autoencoder models, the hybrid decision engine, SHAP explanations, the evaluation experiments, and the FastAPI-backed monitoring dashboard.",
  outcome: "A reproducible prototype showing where supervised detectors stay silent on an unseen attack type, and how an anomaly stream can catch part of what they miss.",
  evidenceScope: "Results come from committed evaluation artifacts on the CIC-IDS2017 dataset. The supervised scores are for a narrow benign-versus-PortScan split, and the held-out DDoS experiment uses one excluded attack category. Neither is evidence of real-world or general zero-day detection. The public deployment serves the monitoring dashboard; its hosted API endpoints are not currently verified. FalseQuiet was previously named H-NIDS.",
  technologies: ["Python", "FastAPI", "XGBoost", "PyTorch", "TabTransformer", "SHAP"],
  art: "/media/github/falsequiet/hero.svg",
  period: "2026",
  links: {
    live: "https://falsequiet.vercel.app",
    source: repository,
  },
  availability: { live: "verified", source: "verified" },
  visibility: { featured: true, portfolio: true, resume: true },
  media: [],
  problem: "Supervised intrusion detectors learn the attacks in their training data. Faced with a new attack type, they often label it as normal traffic or force it into a known category, which is the most dangerous kind of quiet.",
  whyItMatters: "Security teams need to know both what a detector catches and where it goes silent. A high accuracy number on known attacks says little about the attacks that matter most.",
  constraints: [
    "The held-out experiment must exclude the attack category from all supervised training.",
    "Every reported number must come from a committed evaluation artifact.",
    "Explanations must point to the flow features that drove a verdict.",
  ],
  workflow: "Network flow features feed two streams in parallel: supervised classifiers estimate the probability of a known attack, and an autoencoder trained only on benign traffic scores reconstruction error. A fusion engine combines both into Normal, Known Attack, or Suspicious, and SHAP attributes the verdict to features.",
  hardPart: "The hard part was designing an honest test for unseen attacks. DDoS was removed from supervised training and replayed afterwards: the supervised models sent 42.3% of those flows to BENIGN, while the hybrid engine flagged 71.1% of the 1,000 held-out flows as a threat.",
  decisions: [
    { title: "Two streams, one verdict", body: "Supervised models handle known attacks; an autoencoder trained on benign traffic catches deviations they were never shown." },
    { title: "Hold an attack category out", body: "Excluding DDoS from training gives a concrete proxy for zero-day behavior instead of a claim." },
    { title: "Explain every flag", body: "SHAP attributions name the flow features behind each verdict so an analyst can check it." },
  ],
  architecture: [
    "CIC-IDS2017 flow features",
    "XGBoost + TabTransformer",
    "Benign-trained autoencoder",
    "Hybrid decision fusion",
    "SHAP explanations",
    "FastAPI + SOC dashboard",
  ],
  implementation: [
    "Supervised baselines include Random Forest, XGBoost, and a PyTorch TabTransformer evaluated on held-out splits.",
    "A symmetric autoencoder trained only on benign traffic flags flows whose reconstruction error crosses a percentile threshold.",
    "The fusion engine maps classifier probability and anomaly score to Normal, Known Attack, or Suspicious.",
    "A FastAPI backend serves the models to a monitoring dashboard with scenario simulation and CSV batch scanning.",
  ],
  testing: [
    "On the benign-versus-PortScan holdout, XGBoost reached 99.994% accuracy on 17,248 flows; this split is narrow and is not a general benchmark.",
    "In the held-out DDoS experiment, the hybrid engine flagged 71.1% of 1,000 unseen attack flows, while the supervised models sent 42.3% of DDoS flows to BENIGN.",
  ],
  results: [
    "The prototype shows a concrete blind spot of supervised detectors on an unseen attack type.",
    "The anomaly stream recovers part of that blind spot, and the result is reported with its limits.",
  ],
  metrics: [
    { label: "Held-out DDoS detection", value: "71.1%", context: "Hybrid engine on 1,000 flows from an attack category excluded from training (CIC-IDS2017)" },
    { label: "Missed as benign", value: "42.3%", context: "Share of held-out DDoS flows the supervised models labeled BENIGN" },
  ],
  limitations: [
    "The held-out experiment covers one excluded CIC-IDS2017 category; it is not proof of real-world zero-day detection.",
    "The supervised accuracy figures are for a narrow two-class split.",
    "The repository does not contain a comparable aggregate benchmark for the fused engine.",
    "The hosted API endpoints on the public deployment are not currently verified.",
  ],
  lessons: [
    "Report where a detector is silent, not only where it is accurate.",
    "A proxy experiment is useful when it is labeled as a proxy.",
  ],
  nextIteration: "Repeat the held-out experiment across every attack category and a second dataset, then report the fused engine with a single comparable benchmark.",
  claimIds: ["falsequiet-heldout-ddos"],
  seo: {
    title: "FalseQuiet · Hybrid Network Intrusion Detection Case Study",
    description: "FalseQuiet combines XGBoost and TabTransformer classifiers with an autoencoder and SHAP to detect known attacks and flag unseen ones, evaluated on CIC-IDS2017 with stated limits.",
  },
};
