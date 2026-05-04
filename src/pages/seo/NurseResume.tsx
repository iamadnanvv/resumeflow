import { SeoLanding } from "@/components/SeoLanding";

export default function NurseResume() {
  return (
    <SeoLanding
      path="/nurse-resume"
      metaTitle="Nursing Resume Builder — RN, BSN, ICU, ER, NICU & Travel Nurses"
      metaDescription="Build a nursing resume tailored to RN, BSN, ICU, ER, and travel roles. License-ready sections, ATS-safe templates, and AI rewrites for clinical bullets."
      eyebrow="Nursing"
      h1="A nursing resume hospitals actually shortlist."
      highlight="hospitals actually shortlist"
      intro="Hospital recruiters use ATS systems too. resumelylite formats your nursing resume so credentials, licenses, and patient-load impact are surfaced first — exactly what nurse managers screen for."
      primaryCta={{ label: "Build my nursing resume", to: "/dashboard?role=nurse" }}
      benefits={[
        "Dedicated sections for licenses, certifications (BLS, ACLS, PALS), and CEUs",
        "Bullets that quantify patient load, acuity, and outcomes",
        "Specialty-aware: ICU, ER, NICU, OR, Med-Surg, L&D, Travel",
        "EHR keywords: Epic, Cerner, Meditech",
        "ATS-safe single-column layout for hospital systems (Workday, iCIMS)",
        "Cover letter generator for travel and per-diem applications",
      ]}
      sections={[
        {
          heading: "Lead with credentials, not objective statements",
          body: (
            <p>
              Nurse managers want to see license number, state, BSN, and certifications first.
              resumelylite places these in the header so they're impossible to miss.
            </p>
          ),
        },
        {
          heading: "Quantify patient impact",
          body: (
            <p>
              "Cared for patients" is invisible. "Managed 6-patient ICU load (2:1 ventilated)
              with zero CLABSI events over 14 months" tells a hiring manager everything.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Should I include my license number?",
          a: "Most US hospitals expect at least state and license type. resumelylite has dedicated fields for both.",
        },
        {
          q: "What about clinical rotations for new grads?",
          a: "Yes — include rotations with units, weeks, and supervising preceptor where allowed.",
        },
        {
          q: "Is the template good for travel-nurse contracts?",
          a: "Yes — the Experience section supports short contracts back-to-back without looking cluttered.",
        },
      ]}
      internalLinks={[
        { label: "Teacher Resume", to: "/teacher-resume", description: "K–12 and higher-ed templates." },
        { label: "ATS Resume", to: "/ats-resume", description: "Pass hospital ATS filters." },
        { label: "Cover Letter Generator", to: "/cover-letter-generator", description: "Personalized hospital cover letters." },
      ]}
    />
  );
}