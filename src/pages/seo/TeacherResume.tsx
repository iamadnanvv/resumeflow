import { SeoLanding } from "@/components/SeoLanding";

export default function TeacherResume() {
  return (
    <SeoLanding
      path="/teacher-resume"
      metaTitle="Teacher Resume Builder — K–12, Higher Ed, ESL & Special Ed"
      metaDescription="Build a teacher resume that highlights certifications, classroom outcomes, and curriculum impact. ATS-safe templates and AI bullet rewrites for educators."
      eyebrow="Teacher / Educator"
      h1="A teacher resume that puts impact above duties."
      highlight="impact above duties"
      intro="Hiring committees see the same generic teacher resumes every season. resumelylite helps you stand out by quantifying student outcomes, curriculum design, and classroom leadership."
      benefits={[
        "Sections for credentials, endorsements, and PD/CEUs",
        "Bullets quantifying test gains, retention, and engagement",
        "Specialty-aware: K–12, higher ed, ESL, SPED, Montessori",
        "Keyword matching for Google Classroom, Canvas, Schoology, IXL",
        "ATS-safe layout — many districts now use enterprise ATS",
        "Cover letter generator personalized per school and district",
      ]}
      sections={[
        {
          heading: "Show outcomes, not lesson plans",
          body: (
            <p>
              Replace "taught 5th grade math" with "Taught 5th grade math (28 students); raised
              standardized math scores 14% YoY and grew honors enrollment 3x in 2 years."
              resumelylite rewrites bullets into outcome-first form automatically.
            </p>
          ),
        },
        {
          heading: "Differentiate with curriculum and leadership",
          body: (
            <p>
              Curriculum design, mentoring new teachers, leading committees — these are the
              signals principals scan for. The builder gives them their own callouts.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Should I include my teaching license number?",
          a: "State and certification type, yes; full number is optional unless required by the posting.",
        },
        {
          q: "How long should a teacher resume be?",
          a: "One page early career, two pages if you have leadership, curriculum work, or 10+ years.",
        },
        {
          q: "Where do I put student-teaching?",
          a: "Under Experience for new grads, with school, grade, and supervising teacher.",
        },
      ]}
      internalLinks={[
        { label: "Nurse Resume", to: "/nurse-resume", description: "Other licensed-profession templates." },
        { label: "ATS Resume", to: "/ats-resume", description: "Pass district ATS filters." },
        { label: "Cover Letter Generator", to: "/cover-letter-generator", description: "Personalized district cover letters." },
      ]}
    />
  );
}