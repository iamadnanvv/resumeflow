export type RolePreset = {
  slug: string;
  label: string;
  title: string; // headline / target role
  summary: string; // seeded summary placeholder
  skills: string[];
  keywordPrompts: string[]; // shown in builder banner
};

export const ROLE_PRESETS: Record<string, RolePreset> = {
  "software-engineer": {
    slug: "software-engineer",
    label: "Software Engineer",
    title: "Software Engineer",
    summary:
      "Software engineer with experience shipping production systems at scale. Strong in [language/framework], with a track record of measurable impact on latency, reliability, and developer velocity.",
    skills: ["TypeScript", "React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "Kubernetes"],
    keywordPrompts: [
      "Quantify scale (RPS, users, data volume)",
      "Mention latency / reliability wins (p95, uptime)",
      "Include stack: React, Go, Kubernetes, AWS",
      "Link GitHub and a flagship project",
    ],
  },
  "product-manager": {
    slug: "product-manager",
    label: "Product Manager",
    title: "Product Manager",
    summary:
      "Product manager who ships outcomes, not features. Experienced partnering with engineering, design, and data to grow [metric] across [product area].",
    skills: ["Roadmapping", "A/B Testing", "SQL", "Figma", "Mixpanel", "Amplitude", "Jira", "JTBD"],
    keywordPrompts: [
      "Lead with ARR / retention / activation lift",
      "Mention frameworks: RICE, JTBD, North Star",
      "Tools: Jira, Figma, SQL, Mixpanel, Amplitude",
      "Show shipped products with users impacted",
    ],
  },
  "data-scientist": {
    slug: "data-scientist",
    label: "Data Scientist",
    title: "Data Scientist",
    summary:
      "Data scientist combining ML rigor with business impact. Built and shipped models that moved [metric] by [%] across [domain].",
    skills: ["Python", "PyTorch", "TensorFlow", "SQL", "dbt", "Spark", "MLflow", "Airflow"],
    keywordPrompts: [
      "Pair model + metric + business outcome",
      "Tools: Python, PyTorch, SQL, dbt, Spark, MLflow",
      "Add Kaggle / publications / notebooks",
      "Quantify lift: revenue, retention, cost saved",
    ],
  },
  "designer": {
    slug: "designer",
    label: "UX / Product Designer",
    title: "Product Designer",
    summary:
      "Product designer pairing craft with measurable outcomes. Owned end-to-end flows from research to ship across web and mobile.",
    skills: ["Figma", "Sketch", "Design Systems", "User Research", "Prototyping", "Accessibility"],
    keywordPrompts: [
      "Outcome-led bullets: activation, conversion, task time",
      "Tools: Figma, Sketch, design systems, research ops",
      "Link portfolio, case studies, Dribbble/Behance",
      "Mention design system contributions",
    ],
  },
  "marketing": {
    slug: "marketing",
    label: "Marketing",
    title: "Marketing Manager",
    summary:
      "Marketer who owns the number. Generated [pipeline/$] across [channels] with measurable CAC payback and ROAS.",
    skills: ["HubSpot", "Marketo", "GA4", "Looker", "Segment", "SEO", "Paid Media", "Lifecycle"],
    keywordPrompts: [
      "Lead bullets with pipeline / ROAS / CAC / MQLs",
      "Channel context: paid, content, lifecycle, ABM",
      "Tools: HubSpot, Marketo, GA4, Looker, Segment",
      "Show launches and campaign budgets",
    ],
  },
  "sales": {
    slug: "sales",
    label: "Sales",
    title: "Account Executive",
    summary:
      "Quota-carrying seller with consistent attainment. Closed [$] across [segment] with avg ACV [$] and strong multi-thread motion.",
    skills: ["Salesforce", "Outreach", "Gong", "ZoomInfo", "MEDDIC", "Challenger", "Forecasting"],
    keywordPrompts: [
      "Quota → attainment → # deals → ACV → marquee logo",
      "Multi-year attainment for consistency",
      "Tools: Salesforce, Outreach, Gong, ZoomInfo",
      "Methodology: MEDDIC, SPIN, Challenger",
    ],
  },
  "nurse": {
    slug: "nurse",
    label: "Nurse",
    title: "Registered Nurse",
    summary:
      "Registered Nurse (RN, BSN) with experience across [specialty]. Strong patient-load outcomes and credentialed in BLS / ACLS.",
    skills: ["Epic", "Cerner", "Meditech", "BLS", "ACLS", "PALS", "Patient Education"],
    keywordPrompts: [
      "Quantify patient load and acuity",
      "List licenses, state, BSN, certifications first",
      "Specialty: ICU / ER / NICU / OR / Med-Surg / L&D",
      "EHR keywords: Epic, Cerner, Meditech",
    ],
  },
  "teacher": {
    slug: "teacher",
    label: "Teacher / Educator",
    title: "Teacher",
    summary:
      "Educator focused on outcomes over duties. Raised student performance and led curriculum / mentoring initiatives across [grade/subject].",
    skills: ["Curriculum Design", "Google Classroom", "Canvas", "Schoology", "IXL", "Differentiated Instruction"],
    keywordPrompts: [
      "Quantify test gains, retention, engagement",
      "Specialty: K–12, ESL, SPED, Montessori, Higher Ed",
      "Tools: Google Classroom, Canvas, Schoology, IXL",
      "Show curriculum design & leadership",
    ],
  },
};

export function getRolePreset(slug?: string | null): RolePreset | null {
  if (!slug) return null;
  return ROLE_PRESETS[slug] ?? null;
}