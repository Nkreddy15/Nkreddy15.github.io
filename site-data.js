"use strict";

// Verified against the owner's repository READMEs and current master résumé.
// Update copy here when the underlying projects change.
const PORTFOLIO_EMAIL = "nikhilkumarreddyc.15.11.2002@gmail.com";
const PORTFOLIO_PROJECTS = Object.freeze({
  ginkgo: {
    title: "Ginkgo ADMET predictive modeling",
    category: "Scientific machine learning / Graduate project contribution",
    summary: "My individual contribution to a graduate molecular ML project: feature generation, ChemBERTa embeddings on Northeastern's Explorer HPC cluster, and regularized prediction baselines for three ADMET endpoints.",
    technologies: ["Python", "RDKit", "Morgan fingerprints", "ChemBERTa", "scikit-learn", "SLURM"],
    contributions: [
      "Combined 8 physicochemical descriptors, 1,024 Morgan fingerprint bits, and 768 ChemBERTa dimensions into 1,800 numeric features per compound.",
      "Generated molecular embeddings on Explorer HPC; repository evidence includes the historical SLURM job and output logs.",
      "Compared regularized Ridge and ElasticNet with limited-complexity Random Forest and Gradient Boosting models.",
      "Documented target ambiguity, censored measurements, replicate leakage risks, and stronger validation approaches."
    ],
    metrics: [
      ["Kinetic solubility", "Ridge", "0.164"],
      ["Microsomal stability", "Random Forest", "−0.055"],
      ["CYP2D6 inhibition", "Ridge", "0.342"]
    ],
    metricCaption: "Historical individual HW4A experiment · held-out Spearman's ρ · random split. These values are the verified personal results in the repository.",
    learning: "The weak and mixed baseline results made careful evaluation central to the project. Compound-aware and scaffold-based splits remain stronger follow-up approaches; the historical random split alone cannot establish generalization to new chemical scaffolds.",
    repo: "https://github.com/Nkreddy15/ginkgo-admet-predictive-modeling",
    evidence: "https://github.com/Nkreddy15/ginkgo-admet-predictive-modeling/blob/main/docs/INDIVIDUAL_CONTRIBUTION.md",
    evidenceLabel: "Contribution & evidence"
  },
  attrition: {
    title: "Employee attrition prediction API",
    category: "Applied machine learning / Independent project",
    summary: "A machine learning REST API for employee attrition prediction, built around structured demographic, job, compensation, commute, and performance features.",
    technologies: ["Python", "Flask", "Pandas", "scikit-learn", "Joblib", "Docker"],
    contributions: [
      "Built a preprocessing workflow with missing-value handling, categorical encoding, and feature scaling.",
      "Trained a Gradient Boosting classification model and saved model artifacts for reuse.",
      "Served predictions through the Flask POST /predict endpoint with JSON requests and responses.",
      "Packaged a Docker-compatible application with local setup and API usage documentation."
    ],
    learning: "This project connects model development to a usable software interface. The repository's roadmap includes stronger request validation, expanded model comparisons, and additional explanation and testing work.",
    repo: "https://github.com/Nkreddy15/Employee-Attrition-Prediction-API",
    evidence: "https://github.com/Nkreddy15/Employee-Attrition-Prediction-API/blob/main/README.md",
    evidenceLabel: "API & setup documentation"
  },
  readmission: {
    title: "Privacy-preserving healthcare readmission",
    category: "Responsible AI / Group project",
    summary: "A collaborative healthcare study examining 30-day hospital readmission predictions, differential privacy, class imbalance, and model behavior across racial groups in the UCI diabetic readmission dataset.",
    technologies: ["Python", "Pandas", "scikit-learn", "diffprivlib", "Matplotlib", "Jupyter"],
    contributions: [
      "Contributed to data preparation, model-oriented analysis, evaluation, and project documentation in a group setting.",
      "Investigated privacy-aware learning through IBM diffprivlib and balanced classification workflows.",
      "Examined race-based prediction differences with fairness-oriented metrics.",
      "Helped communicate tradeoffs between predictive performance, fairness, and privacy."
    ],
    learning: "A useful healthcare model needs more than an overall accuracy figure. This educational study explores subgroup behavior and privacy tradeoffs; it does not establish clinical readiness.",
    repo: "https://github.com/Nkreddy15/privacy-preserving-healthcare-readmission",
    evidence: "https://github.com/Nkreddy15/privacy-preserving-healthcare-readmission/blob/main/README.md",
    evidenceLabel: "Methodology & reported results"
  },
  privacy: {
    title: "Differential privacy for medical AI",
    category: "Privacy–utility experiment / Educational study",
    summary: "A medical tumor-classification experiment comparing Logistic Regression on original and privacy-transformed data, with attention to personally identifiable fields and class imbalance.",
    technologies: ["Python", "Pandas", "NumPy", "scikit-learn", "Hashlib"],
    contributions: [
      "Worked with SHA-256 transformations of PII-like fields and date-of-birth to age conversion.",
      "Applied Laplace-noise transformations and compared model performance before and after privacy processing.",
      "Documented the privacy–utility tradeoff and weak minority-class performance.",
      "Kept raw data in a local-only, Git-ignored workflow."
    ],
    learning: "The repository reports lower classification accuracy after the privacy transformations. The work is an educational comparison; formal privacy guarantees depend on the mechanism and privacy-budget accounting, and hashing alone does not provide anonymity.",
    repo: "https://github.com/Nkreddy15/differential-privacy-medical-ai",
    evidence: "https://github.com/Nkreddy15/differential-privacy-medical-ai/blob/main/README.md",
    evidenceLabel: "Experiment documentation"
  },
  aws: {
    title: "AWS medical SaaS cloud architecture",
    category: "Cloud systems / Conceptual architecture case study",
    summary: "A documented AWS migration design for a fictional healthcare SaaS platform, covering scaling, private network tiers, multi-region content delivery, database resilience, and operational visibility.",
    technologies: ["AWS", "VPC", "EC2", "RDS", "CloudFront", "Cognito", "CloudWatch"],
    contributions: [
      "Designed separate development and production VPCs spanning two Availability Zones.",
      "Placed load balancers in public subnets and application and database workloads in private subnets.",
      "Proposed Auto Scaling and RDS SQL Server with Multi-AZ failover.",
      "Documented identity, monitoring, auditing, secrets management, and infrastructure automation choices."
    ],
    learning: "The deliverable is an architecture and design case study. Implementation, cost analysis, and formal compliance validation are documented follow-up work.",
    repo: "https://github.com/Nkreddy15/aws-medical-saas-cloud-architecture",
    evidence: "https://github.com/Nkreddy15/aws-medical-saas-cloud-architecture/blob/main/README.md",
    evidenceLabel: "Architecture documentation"
  },
  signal: {
    title: "Signal Vault",
    category: "Trading research prototype / In development",
    summary: "An independent research and paper-trading infrastructure project, currently focused on BTC/USD market-data evidence, risk controls, persistent order journals, and reproducible research workflows.",
    technologies: ["Python", "SQLite", "Alpaca paper", "Market data", "Risk controls"],
    contributions: [
      "Developed modular research and paper-trading infrastructure with persistent state and recovery paths.",
      "Worked on market-data capture, fee and slippage accounting, and chronological evaluation.",
      "Added operator monitoring, halt controls, and reconciliation-oriented journal workflows.",
      "Documented failed strategy candidates and kept research results separate from live performance claims."
    ],
    learning: "This is an evolving research prototype. Profitability, live execution, and production multi-market support are not demonstrated by this portfolio.",
    repo: "https://github.com/Nkreddy15/signal-vault",
    private: true
  },
  frontdesk: {
    title: "Frontdesk — AI receptionist pilot",
    category: "Full-stack AI product / Local pilot application",
    summary: "A local appointment-booking application and owner dashboard, with a deterministic conversation controller and voice, calendar, and messaging adapters prepared for further validation.",
    technologies: ["Next.js", "Fastify", "PostgreSQL", "TypeScript", "Provider adapters"],
    contributions: [
      "Built a local owner dashboard for schedules, booking changes, service settings, and customer history.",
      "Used database exclusions, expiring holds, version checks, and idempotent retries to address booking conflicts.",
      "Prepared a conversation controller for readback, correction, cancellation, rescheduling, and human handoff.",
      "Prepared provider adapters and documented the remaining release checks."
    ],
    learning: "The current deliverable is a local pilot. Real telephone audio, native database concurrency, calendar synchronization, messaging delivery, and production readiness still require validation.",
    repo: "https://github.com/Nkreddy15/frontdesk-pilot",
    private: true
  }
});
