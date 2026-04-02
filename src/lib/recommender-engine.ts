import type { ModuleBank } from "@/types/banks/moduleBank";
import type { Term, Year } from "@/types/planner";
import { terms } from "@/types/planner";
import type { ModuleCode } from "@/types/primitives/module";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LearningPreference = "depth" | "breadth";

export type RecommendInput = {
  jobRole: string;
  interests: string;
  preference: LearningPreference;
  hasTranscript: boolean;
};

export type RecommendedModule = {
  moduleCode: ModuleCode;
  name: string;
  reason: string;
  year: Year;
  term: Term;
  priority: "essential" | "recommended" | "optional";
  skillsGained: string[];
};

export type RecommendationResult = {
  jobRoleDetected: string;
  currentSkills: string[];
  skillGaps: string[];
  recommendedModules: RecommendedModule[];
  learningPathSummary: string;
};

// ─── Module skills mapping ────────────────────────────────────────────────────

const MODULE_SKILLS: Record<string, string[]> = {
  IS112: ["SQL", "Database Design", "Relational Modelling", "Data Querying"],
  IS113: ["HTML/CSS", "JavaScript", "Web Development", "DOM Manipulation"],
  IS114: ["Python", "Data Analysis", "Machine Learning Basics", "AI Fundamentals"],
  IS210: ["Java", "OOP", "Enterprise Patterns", "Backend Development"],
  IS211: ["UX Design", "Prototyping", "Usability Testing", "Human-Centred Design"],
  IS212: ["Agile", "Project Planning", "Risk Management", "Team Leadership"],
  IS213: ["Microservices", "API Design", "Cloud Integration", "Container Apps"],
  IS214: ["IT Governance", "Enterprise Architecture", "ITIL", "IT Strategy"],
  IS215: ["Digital Transformation", "Business Strategy", "Emerging Tech"],
  IS216: ["React", "Next.js", "Full-Stack Development", "REST APIs"],
  IS412: ["Advanced Enterprise Dev", "Cloud-Native Apps", "Distributed Systems"],
  IS442: ["Product Development", "Entrepreneurship", "Full-Lifecycle Dev"],
  IS458: ["Generative AI", "LLM Applications", "AI Product Engineering"],
  IS492: ["System Design", "Capstone", "Professional Engineering Practice"],
  IS446: ["Blockchain", "IoT", "Emerging Tech Integration"],
  CS101: ["Python", "Algorithms", "Problem Solving", "OOP Basics"],
  CS102: ["Advanced Programming", "Data Structures", "Algorithm Design"],
  CS206: ["Software Architecture", "Design Patterns", "SOLID Principles"],
  CS301: ["Algorithms", "Complexity Theory", "Graph Algorithms", "Dynamic Programming"],
  CS440: ["Machine Learning", "Deep Learning", "Model Training", "Feature Engineering"],
  CS443: ["Cloud Computing", "AWS/Azure", "Containerisation", "Kubernetes"],
  CS461: ["NLP", "Text Analytics", "Transformers", "Language Modelling"],
  CS462: ["Data Mining", "Association Rules", "Clustering", "Anomaly Detection"],
  SE301: ["Software Testing", "TDD", "CI/CD Pipelines", "Quality Assurance"],
  "COR-STAT1202": ["Statistics", "Hypothesis Testing", "Statistical Inference"],
  "COR1202": ["Statistics", "Probability", "Quantitative Methods"],
  "COR1301": ["Leadership", "Team Dynamics", "Communication"],
  "COR1306": ["Business Strategy", "Competitive Analysis", "Strategic Planning"],
  "COR1307": ["Marketing", "Market Segmentation", "Brand Strategy"],
  "COR3302": ["Technology Ethics", "AI Ethics", "Digital Rights"],
  "COR-MGMT1302": ["Organisational Management", "Planning", "Coordination"],
  "COR-MGMT1303": ["Stakeholder Management", "Negotiation", "Engagement"],
  "COR-OBHR1309": ["Organisational Behaviour", "Motivation", "Culture"],
};

// ─── Recommended year/term per module ────────────────────────────────────────

const MODULE_SCHEDULE: Record<string, { year: Year; term: Term }> = {
  // Year 1 – Foundation
  IS112:          { year: "1", term: "Term 1" },
  IS113:          { year: "1", term: "Term 2" },
  IS114:          { year: "1", term: "Term 2" },
  CS101:          { year: "1", term: "Term 1" },
  "COR1202":      { year: "1", term: "Term 2" },
  "COR-STAT1202": { year: "1", term: "Term 2" },
  "COR1301":      { year: "1", term: "Term 1" },
  "COR-MGMT1302": { year: "1", term: "Term 2" },

  // Year 2 – Core
  IS210:          { year: "2", term: "Term 1" },
  IS211:          { year: "2", term: "Term 1" },
  IS212:          { year: "2", term: "Term 2" },
  IS213:          { year: "2", term: "Term 2" },
  IS214:          { year: "2", term: "Term 2" },
  IS215:          { year: "2", term: "Term 1" },
  IS216:          { year: "2", term: "Term 2" },
  CS102:          { year: "2", term: "Term 1" },
  CS206:          { year: "2", term: "Term 2" },
  "COR1307":      { year: "2", term: "Term 1" },
  "COR1306":      { year: "2", term: "Term 2" },
  "COR-MGMT1303": { year: "2", term: "Term 1" },
  "COR-OBHR1309": { year: "2", term: "Term 2" },

  // Year 3 – Advanced
  CS301:    { year: "3", term: "Term 1" },
  CS440:    { year: "3", term: "Term 1" },
  CS443:    { year: "3", term: "Term 2" },
  IS412:    { year: "3", term: "Term 1" },
  IS458:    { year: "3", term: "Term 2" },
  CS462:    { year: "3", term: "Term 2" },
  SE301:    { year: "3", term: "Term 1" },
  "COR3302": { year: "3", term: "Term 1" },

  // Year 4 – Specialisation & Capstone
  IS442: { year: "4", term: "Term 1" },
  IS492: { year: "4", term: "Term 2" },
  CS461: { year: "4", term: "Term 1" },
  IS446: { year: "4", term: "Term 2" },
};

// ─── Job role definitions ─────────────────────────────────────────────────────

type JobProfile = {
  displayName: string;
  requiredSkills: string[];
  coreModuleCodes: string[];
  electiveModuleCodes: string[];
  learningPathSummary: (pref: LearningPreference) => string;
};

const JOB_PROFILES: Record<string, JobProfile> = {
  "software-engineer": {
    displayName: "Software Engineer",
    requiredSkills: [
      "Programming Fundamentals", "Data Structures & Algorithms",
      "Software Design Patterns", "Database Management",
      "Testing & QA", "API Development", "Version Control",
    ],
    coreModuleCodes: ["IS112", "IS113", "IS210", "IS212", "CS206", "CS301"],
    electiveModuleCodes: ["IS216", "IS213", "SE301", "CS443", "IS412", "CS102"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path focuses on deep software engineering fundamentals — mastering algorithms, design patterns, and enterprise-grade backend development before specialising in advanced systems."
        : "Your path balances software engineering breadth with business acumen — covering full-stack development, project management, and cloud, giving you well-rounded industry readiness.",
  },
  "data-scientist": {
    displayName: "Data Scientist",
    requiredSkills: [
      "Python Programming", "Machine Learning", "Statistical Analysis",
      "Data Visualisation", "SQL & Databases", "Feature Engineering", "Deep Learning",
    ],
    coreModuleCodes: ["IS112", "IS114", "COR-STAT1202", "CS440", "CS462"],
    electiveModuleCodes: ["CS461", "IS458", "CS301", "CS206", "CS102"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path takes you deep into the data science stack — from statistical foundations through ML modelling, NLP, and data mining — positioning you to tackle complex AI problems."
        : "Your path builds a broad data science toolkit — pairing strong quantitative skills with business intelligence and communication, ensuring you bridge the gap between data and decisions.",
  },
  "devops-engineer": {
    displayName: "DevOps / DevSecOps Engineer",
    requiredSkills: [
      "Cloud Computing", "CI/CD Pipelines", "Containerisation",
      "Infrastructure as Code", "Security Engineering", "Monitoring & Observability",
    ],
    coreModuleCodes: ["IS112", "CS443", "IS212", "SE301", "CS206"],
    electiveModuleCodes: ["IS213", "IS412", "CS301", "IS214"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path focuses on the full DevOps lifecycle — cloud-native infrastructure, security-first engineering, and robust CI/CD practices to deliver software reliably at scale."
        : "Your path blends DevOps technical skills with IT governance and enterprise management, giving you the breadth to lead platform and reliability initiatives across large organisations.",
  },
  "full-stack-developer": {
    displayName: "Full-Stack Developer",
    requiredSkills: [
      "Frontend Development", "Backend Development", "Database Management",
      "REST APIs & GraphQL", "State Management", "Deployment & CI/CD",
    ],
    coreModuleCodes: ["IS112", "IS113", "IS216", "IS210", "IS213"],
    electiveModuleCodes: ["CS443", "IS412", "CS206", "SE301", "IS212"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path follows the full-stack engineer's journey — HTML/CSS foundations through to React, enterprise backend patterns, microservices, and cloud deployment."
        : "Your path combines full-stack engineering with product thinking and project management — building both the technical skills to ship features and the soft skills to lead delivery.",
  },
  "ai-ml-engineer": {
    displayName: "AI / ML Engineer",
    requiredSkills: [
      "Machine Learning", "Deep Learning", "Natural Language Processing",
      "Python & Data Pipelines", "Model Deployment", "LLM Engineering", "MLOps",
    ],
    coreModuleCodes: ["IS112", "IS114", "CS440", "CS461", "IS458"],
    electiveModuleCodes: ["CS462", "CS301", "CS206", "CS102"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path goes deep into AI — from classical ML through deep learning and NLP, culminating in building and deploying LLM-powered applications for real-world use."
        : "Your path builds AI/ML expertise alongside software engineering principles and ethics — ensuring you can build responsible, production-ready AI systems across diverse domains.",
  },
  "cybersecurity-analyst": {
    displayName: "Cybersecurity Analyst",
    requiredSkills: [
      "Network Security", "Vulnerability Assessment", "Cryptography",
      "Risk Management", "Incident Response", "Security Governance", "Digital Forensics",
    ],
    coreModuleCodes: ["IS112", "IS214", "IS215", "CS443"],
    electiveModuleCodes: ["CS206", "IS212", "SE301", "COR3302", "IS213"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path builds deep cybersecurity expertise — from secure systems design through IT governance, cloud security, and risk management frameworks."
        : "Your path pairs cybersecurity fundamentals with broader digital business and technology ethics — preparing you for strategic security roles in diverse organisations.",
  },
  "product-manager": {
    displayName: "Product Manager",
    requiredSkills: [
      "Product Strategy & Vision", "User Research & UX", "Data-Driven Decision Making",
      "Agile / Scrum", "Stakeholder Management", "Technical Literacy", "Go-to-Market",
    ],
    coreModuleCodes: ["IS211", "IS212", "IS215", "COR1306", "COR1307"],
    electiveModuleCodes: ["IS114", "IS214", "COR-MGMT1303", "COR-OBHR1309", "IS113"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path focuses on the PM craft — UX design, agile delivery, business strategy, and data analytics — giving you the depth to own products end-to-end."
        : "Your path builds a broad PM foundation spanning UX, strategy, organisational behaviour, and technical awareness — ideal for PMs in large, cross-functional product teams.",
  },
  "business-analyst": {
    displayName: "Business Analyst",
    requiredSkills: [
      "Requirements Elicitation", "Process Modelling", "Data Analysis",
      "Stakeholder Communication", "SQL", "Business Process Improvement", "Systems Thinking",
    ],
    coreModuleCodes: ["IS112", "IS214", "IS215", "COR-STAT1202", "COR1306"],
    electiveModuleCodes: ["IS211", "IS114", "CS462", "COR-MGMT1302", "IS212"],
    learningPathSummary: (pref) =>
      pref === "depth"
        ? "Your path builds rigorous BA expertise — data management, enterprise systems, statistics, and strategic analysis — preparing you for complex requirements and digital transformation projects."
        : "Your path combines analytical skills with interpersonal and management modules — equipping you to work across business and IT functions as a versatile problem-solver.",
  },
};

// ─── Interest → skills parser ─────────────────────────────────────────────────

const INTEREST_KEYWORD_MAP: Record<string, string[]> = {
  python:           ["Python Programming", "Scripting", "Data Processing"],
  javascript:       ["JavaScript", "TypeScript", "Frontend Development"],
  typescript:       ["TypeScript", "Type-Safe Development", "JavaScript"],
  react:            ["React", "Component Design", "State Management"],
  nextjs:           ["Next.js", "Server-Side Rendering", "Full-Stack JS"],
  sql:              ["SQL Querying", "Database Design", "Relational Modelling"],
  database:         ["Database Management", "SQL", "Data Persistence"],
  data:             ["Data Analysis", "Data Visualisation", "Statistical Computing"],
  "machine learning": ["Machine Learning", "Model Training", "Feature Engineering"],
  ml:               ["Machine Learning", "Model Evaluation", "Supervised Learning"],
  ai:               ["Artificial Intelligence", "AI Applications", "Ethics in AI"],
  nlp:              ["Natural Language Processing", "Text Analytics", "Language Models"],
  cloud:            ["Cloud Computing", "IaaS/PaaS", "Cloud Architecture"],
  aws:              ["AWS", "Cloud Services", "Serverless"],
  azure:            ["Azure", "Cloud Services", "Microsoft Stack"],
  devops:           ["CI/CD", "Infrastructure as Code", "DevOps Culture"],
  devsecops:        ["Security Engineering", "DevSecOps", "Vulnerability Management"],
  cybersecurity:    ["Cybersecurity", "Threat Analysis", "Risk Management"],
  docker:           ["Containerisation", "Docker", "Container Orchestration"],
  kubernetes:       ["Kubernetes", "Container Orchestration", "Microservices Ops"],
  ux:               ["UX Design", "User Research", "Usability Testing"],
  ui:               ["UI Design", "Prototyping", "Design Systems"],
  agile:            ["Agile Methodology", "Scrum", "Iterative Delivery"],
  "project management": ["Project Planning", "Risk Management", "Stakeholder Communication"],
  blockchain:       ["Blockchain", "Distributed Ledger", "Smart Contracts"],
  "data analytics": ["Data Analytics", "Business Intelligence", "Dashboard Design"],
  statistics:       ["Statistics", "Hypothesis Testing", "Quantitative Methods"],
  web:              ["Web Development", "Frontend", "HTTP Protocols"],
};

function parseInterests(interestsInput: string): string[] {
  const lower = interestsInput.toLowerCase();
  const skills = new Set<string>();
  for (const [keyword, mappedSkills] of Object.entries(INTEREST_KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      mappedSkills.forEach((s) => skills.add(s));
    }
  }
  return Array.from(skills);
}

// ─── Job role detector ────────────────────────────────────────────────────────

function detectJobRole(jobRoleInput: string): keyof typeof JOB_PROFILES {
  const lower = jobRoleInput.toLowerCase();
  if (/data\s*scien|data\s*analy/.test(lower)) return "data-scientist";
  if (/\bai\b|\bml\b|machine\s*learn|artificial\s*intel/.test(lower)) return "ai-ml-engineer";
  if (/full.?stack|fullstack/.test(lower)) return "full-stack-developer";
  if (/devops|devsecops|platform\s*eng|site\s*reliab|sre/.test(lower)) return "devops-engineer";
  if (/cyber|security\s*analy|infosec|information\s*sec/.test(lower)) return "cybersecurity-analyst";
  if (/product\s*manag|product\s*owner/.test(lower)) return "product-manager";
  if (/business\s*analy|sys(tem)?\s*analy/.test(lower)) return "business-analyst";
  if (/web\s*dev|front.?end\s*dev/.test(lower)) return "full-stack-developer";
  return "software-engineer";
}

// ─── Reason generator ────────────────────────────────────────────────────────

const REASON_TEMPLATES: Record<string, (job: string) => string> = {
  IS112: (job) => `Databases are foundational for ${job}s. This module gives you practical SQL skills and relational data modelling knowledge used daily in the field.`,
  IS113: (job) => `Web fundamentals are essential for ${job}s. This module establishes your HTML, CSS, and JavaScript foundations for any web-facing project.`,
  IS114: (job) => `Data and AI literacy is increasingly expected of ${job}s. This module introduces Python-based data science workflows and machine learning concepts.`,
  IS210: (job) => `Enterprise application patterns are core competencies for ${job}s working in industry. This module teaches object-oriented design and backend architecture.`,
  IS211: (job) => `Understanding user needs is critical for ${job}s. This module trains you in UX design, user testing, and prototyping — skills valued across technical roles.`,
  IS212: (job) => `Every ${job} will lead or participate in software projects. This module provides agile methodologies and project planning skills essential in industry.`,
  IS213: (job) => `Modern ${job}s work with cloud-native microservices. This module advances your enterprise development skills to distributed, API-first architectures.`,
  IS214: (job) => `${job}s in enterprise settings must understand IT governance. This module covers strategic IT management and enterprise architecture frameworks.`,
  IS215: (job) => `${job}s need to understand the digital business context. This module provides strategic awareness of how technology drives business transformation.`,
  IS216: (job) => `Full-stack React is a core skill for ${job}s. This module teaches modern web application development with React and server-side rendering.`,
  IS412: (job) => `Advanced enterprise development is expected of senior ${job}s. This module brings cloud-native and distributed systems skills to production level.`,
  IS442: (job) => `${job}s who can build products end-to-end are highly valued. This capstone module simulates real-world product development in a team setting.`,
  IS458: (job) => `LLM and generative AI skills are a top priority for ${job}s. This module teaches you to build and deploy AI-powered applications using modern APIs.`,
  CS101: (job) => `Programming fundamentals are non-negotiable for ${job}s. This module builds your core logic, problem-solving, and Python coding skills.`,
  CS102: (job) => `Strong data structures and algorithms knowledge distinguishes top ${job}s. This module advances your programming skills with complexity analysis.`,
  CS206: (job) => `Design patterns and software architecture are expected of professional ${job}s. This module teaches maintainable, scalable code design.`,
  CS301: (job) => `Algorithm design is tested in every ${job} interview. This module builds the algorithmic thinking and problem-solving skills you need.`,
  CS440: (job) => `Machine learning is increasingly required for ${job}s. This module covers supervised/unsupervised learning and neural network fundamentals.`,
  CS443: (job) => `Cloud deployment is a core skill for ${job}s. This module teaches AWS/Azure services, containerisation, and cloud-native architecture.`,
  CS461: (job) => `NLP powers many modern AI products. This module covers language models and text processing — a must for ${job}s working with AI.`,
  CS462: (job) => `Data mining unlocks patterns in large datasets. ${job}s use these techniques for business intelligence and predictive modelling.`,
  SE301: (job) => `Software quality is the hallmark of professional ${job}s. This module teaches testing strategies, CI/CD pipelines, and TDD practices.`,
  "COR-STAT1202": (job) => `Statistical literacy is fundamental for ${job}s who work with data. This module covers hypothesis testing and inference used in data-driven roles.`,
  "COR1202": (job) => `Quantitative methods underpin data-driven decisions for ${job}s. This module provides the statistical foundations for your technical career.`,
  "COR1301": (job) => `Leadership and communication are soft skills every ${job} must develop to advance from individual contributor to tech lead.`,
  "COR1306": (job) => `${job}s who understand business strategy can better align their technical work with organisational goals — a key differentiator in industry.`,
  "COR1307": (job) => `Marketing fundamentals help ${job}s understand user acquisition, product positioning, and go-to-market — valuable context for any tech product.`,
  "COR3302": (job) => `Technology ethics is increasingly important for ${job}s. This module addresses responsible AI, data privacy, and ethical decision-making in tech.`,
  "COR-MGMT1302": (job) => `Organisational management skills help ${job}s navigate company structures, influence decisions, and work effectively with non-technical stakeholders.`,
  "COR-MGMT1303": (job) => `Stakeholder management is a key skill for ${job}s who coordinate across teams. This module builds the negotiation and engagement skills you need.`,
  "COR-OBHR1309": (job) => `Understanding organisational behaviour helps ${job}s thrive in team environments, build relationships, and lead more effectively.`,
};

// ─── Main engine function ─────────────────────────────────────────────────────

export function generateRecommendations(
  input: RecommendInput,
  moduleBank: ModuleBank,
): RecommendationResult {
  const jobKey = detectJobRole(input.jobRole);
  const profile = JOB_PROFILES[jobKey]!;

  const currentSkills = parseInterests(input.interests);

  // Skill gaps = what the job needs that the student hasn't mentioned
  const skillGaps = profile.requiredSkills.filter(
    (required) =>
      !currentSkills.some((cs) =>
        cs.toLowerCase().includes(required.split(" ")[0]!.toLowerCase()),
      ),
  );

  // Build module code list based on depth vs breadth
  const allCodes = input.preference === "depth"
    ? [...profile.coreModuleCodes, ...profile.electiveModuleCodes.slice(0, 3)]
    : [
        ...profile.coreModuleCodes,
        ...profile.electiveModuleCodes,
        "COR1301",
        "COR1307",
      ];

  const uniqueCodes = [...new Set(allCodes)];

  // Build recommended module list, filtering to only what's in the module bank
  const recommendedModules: RecommendedModule[] = uniqueCodes
    .filter((code) => !!moduleBank[code as ModuleCode])
    .map((code) => {
      const schedule = MODULE_SCHEDULE[code] ?? { year: "2" as Year, term: "Term 1" as Term };
      const skills = MODULE_SKILLS[code] ?? [];
      const isCore = profile.coreModuleCodes.includes(code);
      const reasonFn = REASON_TEMPLATES[code];
      const reason = reasonFn
        ? reasonFn(profile.displayName)
        : `Recommended to build skills relevant to your ${profile.displayName} career path.`;

      return {
        moduleCode: code as ModuleCode,
        name: moduleBank[code as ModuleCode]!.name,
        reason,
        year: schedule.year,
        term: schedule.term,
        priority: isCore ? "essential" : "recommended",
        skillsGained: skills.slice(0, 3),
      };
    });

  // Sort by year → term
  recommendedModules.sort((a, b) => {
    if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
    return terms.indexOf(a.term) - terms.indexOf(b.term);
  });

  return {
    jobRoleDetected: profile.displayName,
    currentSkills:
      currentSkills.length > 0
        ? currentSkills.slice(0, 8)
        : ["General Academic Foundation", "Problem Solving", "Academic Research"],
    skillGaps: skillGaps.slice(0, 7),
    recommendedModules,
    learningPathSummary: profile.learningPathSummary(input.preference),
  };
}
