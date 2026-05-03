import { SeoLanding } from "@/components/SeoLanding";

export default function DataScientistResume() {
  return (
    <SeoLanding
      path="/data-scientist-resume"
      metaTitle="Data Scientist Resume Builder — Quantify Models & Business Impact"
      metaDescription="Build a data scientist resume that pairs ML rigor with business outcomes. AI bullet rewrites, ATS-safe templates, sections for papers, Kaggle, and notebooks."
      eyebrow="Data Scientist"
      h1="A data scientist resume that proves business impact."
      highlight="business impact"
      intro="Models are interesting; outcomes get hired. resumelylite helps you frame every project as a metric the business cares about — revenue, retention, lift, or cost saved."
      benefits={[
        "Bullets that pair model + metric + business outcome",
        "Sections for publications, Kaggle, and Jupyter portfolios",
        "Keyword matching for Python, PyTorch, SQL, dbt, Spark, MLflow",
        "Education-forward layout for new PhDs and grads",
        "ATS-safe formatting — no fancy graphs that break parsers",
        "Instant PDF export with crisp typography",
      ]}
      sections={[
        {
          heading: "Stop listing algorithms — start showing lift",
          body: (
            <p>
              "Built XGBoost model" tells a recruiter nothing. "Built churn model (XGBoost,
              0.84 AUC) deployed to 2M users → -18% monthly churn, $4.2M retained ARR" tells
              the whole story. resumelylite rewrites every bullet to that template.
            </p>
          ),
        },
        {
          heading: "Research vs. applied tracks",
          body: (
            <p>
              Heading into research roles? The template surfaces publications, citations, and
              first-author work. Applied DS or ML engineering? It pivots to shipped models,
              latency, and pipelines.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Should I list every model I've trained?",
          a: "No — pick the 2–3 with the clearest business impact per role. Quality over quantity always wins.",
        },
        {
          q: "Where do I put Kaggle or papers?",
          a: "resumelylite has dedicated Projects and Certifications sections; for papers, use the Projects section with the link field.",
        },
        {
          q: "Is a PhD required to use the template?",
          a: "Not at all — the template adapts based on the content you fill in.",
        },
      ]}
      internalLinks={[
        { label: "Software Engineer Resume", to: "/software-engineer-resume", description: "For ML engineering crossover." },
        { label: "Product Manager Resume", to: "/product-manager-resume", description: "Pivoting to data PM? Start here." },
        { label: "ATS Resume", to: "/ats-resume", description: "Get past automated filters first." },
      ]}
    />
  );
}