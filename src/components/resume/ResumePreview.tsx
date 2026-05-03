import { ResumeContent } from "@/lib/resume-types";
import { forwardRef } from "react";

type Props = { content: ResumeContent; template?: string };

export const ResumePreview = forwardRef<HTMLDivElement, Props>(({ content, template = "minimal" }, ref) => {
  if (template === "modern") return <ModernTpl ref={ref} content={content} />;
  if (template === "executive") return <ExecutiveTpl ref={ref} content={content} />;
  return <MinimalTpl ref={ref} content={content} />;
});
ResumePreview.displayName = "ResumePreview";

const Sheet = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div
    ref={ref}
    className="bg-white text-zinc-900 mx-auto shadow-2xl"
    style={{ width: "210mm", minHeight: "297mm", padding: "16mm", fontFamily: "Inter, sans-serif", fontSize: "10.5pt", lineHeight: 1.45 }}
  >
    {children}
  </div>
));
Sheet.displayName = "Sheet";

const MinimalTpl = forwardRef<HTMLDivElement, { content: ResumeContent }>(({ content }, ref) => {
  const p = content.personal;
  return (
    <Sheet ref={ref}>
      <header className="border-b border-zinc-300 pb-4 mb-5">
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.fullName || "Your Name"}</h1>
        {p.title && <div className="text-zinc-600 mt-1 text-sm">{p.title}</div>}
        <div className="text-xs text-zinc-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.website && <span>{p.website}</span>}
        </div>
      </header>
      {p.summary && (
        <Section title="Summary"><p className="text-sm">{p.summary}</p></Section>
      )}
      {content.experience.length > 0 && (
        <Section title="Experience">
          {content.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold text-sm">{e.role}</div>
                <div className="text-xs text-zinc-500">{e.startDate} – {e.endDate}</div>
              </div>
              <div className="text-xs text-zinc-600 mb-1">{e.company}{e.location && ` · ${e.location}`}</div>
              {e.bullets.length > 0 && (
                <ul className="list-disc pl-4 text-sm space-y-0.5">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
      {content.education.length > 0 && (
        <Section title="Education">
          {content.education.map((ed) => (
            <div key={ed.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold text-sm">{ed.degree}</div>
                <div className="text-xs text-zinc-500">{ed.startDate} – {ed.endDate}</div>
              </div>
              <div className="text-xs text-zinc-600">{ed.school}</div>
              {ed.description && <div className="text-sm mt-1">{ed.description}</div>}
            </div>
          ))}
        </Section>
      )}
      {content.skills.length > 0 && (
        <Section title="Skills">
          <div className="text-sm">{content.skills.join(" · ")}</div>
        </Section>
      )}
      {content.projects.length > 0 && (
        <Section title="Projects">
          {content.projects.map((pr) => (
            <div key={pr.id} className="mb-2">
              <div className="font-semibold text-sm">{pr.name} {pr.link && <span className="text-xs text-zinc-500 font-normal">— {pr.link}</span>}</div>
              {pr.description && <div className="text-sm">{pr.description}</div>}
            </div>
          ))}
        </Section>
      )}
      {content.certifications && content.certifications.length > 0 && (
        <Section title="Certifications">
          {content.certifications.map((c) => (
            <div key={c.id} className="mb-1.5 text-sm flex justify-between items-baseline">
              <div>
                <span className="font-semibold">{c.name}</span>
                {c.issuer && <span className="text-zinc-600"> — {c.issuer}</span>}
                {c.link && <span className="text-xs text-zinc-500"> · {c.link}</span>}
              </div>
              {c.date && <div className="text-xs text-zinc-500">{c.date}</div>}
            </div>
          ))}
        </Section>
      )}
      {content.languages && content.languages.length > 0 && (
        <Section title="Languages">
          <div className="text-sm">
            {content.languages.map((l, i) => (
              <span key={l.id}>
                {l.name}{l.proficiency && <span className="text-zinc-500"> ({l.proficiency})</span>}
                {i < content.languages.length - 1 && " · "}
              </span>
            ))}
          </div>
        </Section>
      )}
    </Sheet>
  );
});
MinimalTpl.displayName = "MinimalTpl";

const ModernTpl = forwardRef<HTMLDivElement, { content: ResumeContent }>(({ content }, ref) => {
  const p = content.personal;
  return (
    <Sheet ref={ref}>
      <div className="grid grid-cols-3 gap-6">
        <aside className="col-span-1 border-r border-zinc-200 pr-4">
          <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.fullName || "Your Name"}</h1>
          <div className="text-emerald-700 text-sm mt-1 font-medium">{p.title}</div>
          <div className="mt-4 space-y-1 text-xs text-zinc-600">
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.location && <div>{p.location}</div>}
            {p.website && <div>{p.website}</div>}
          </div>
          {content.skills.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">Skills</div>
              <div className="flex flex-wrap gap-1">
                {content.skills.map((s, i) => (
                  <span key={i} className="text-xs px-1.5 py-0.5 bg-zinc-100 rounded">{s}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
        <div className="col-span-2">
          {p.summary && <Section title="Profile" accent><p className="text-sm">{p.summary}</p></Section>}
          {content.experience.length > 0 && (
            <Section title="Experience" accent>
              {content.experience.map((e) => (
                <div key={e.id} className="mb-3">
                  <div className="font-semibold text-sm">{e.role} <span className="text-zinc-500 font-normal">@ {e.company}</span></div>
                  <div className="text-xs text-zinc-500">{e.startDate} – {e.endDate}</div>
                  {e.bullets.length > 0 && (
                    <ul className="list-disc pl-4 text-sm space-y-0.5 mt-1">
                      {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </Section>
          )}
          {content.education.length > 0 && (
            <Section title="Education" accent>
              {content.education.map((ed) => (
                <div key={ed.id} className="mb-2">
                  <div className="font-semibold text-sm">{ed.degree}</div>
                  <div className="text-xs text-zinc-600">{ed.school} · {ed.startDate} – {ed.endDate}</div>
                </div>
              ))}
            </Section>
          )}
          {content.certifications && content.certifications.length > 0 && (
            <Section title="Certifications" accent>
              {content.certifications.map((c) => (
                <div key={c.id} className="mb-1 text-sm">
                  <span className="font-semibold">{c.name}</span>
                  {c.issuer && <span className="text-zinc-600"> — {c.issuer}</span>}
                  {c.date && <span className="text-xs text-zinc-500"> · {c.date}</span>}
                </div>
              ))}
            </Section>
          )}
          {content.languages && content.languages.length > 0 && (
            <Section title="Languages" accent>
              <div className="flex flex-wrap gap-1">
                {content.languages.map((l) => (
                  <span key={l.id} className="text-xs px-1.5 py-0.5 bg-zinc-100 rounded">
                    {l.name}{l.proficiency && ` · ${l.proficiency}`}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </Sheet>
  );
});
ModernTpl.displayName = "ModernTpl";

const ExecutiveTpl = forwardRef<HTMLDivElement, { content: ResumeContent }>(({ content }, ref) => {
  const p = content.personal;
  return (
    <Sheet ref={ref}>
      <header className="text-center pb-5 mb-5 border-b-2 border-zinc-900">
        <h1 className="text-4xl font-bold tracking-tight uppercase" style={{ fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>{p.fullName || "Your Name"}</h1>
        <div className="text-zinc-600 mt-1 text-sm tracking-widest uppercase">{p.title}</div>
        <div className="text-xs text-zinc-500 mt-2">
          {[p.email, p.phone, p.location, p.website].filter(Boolean).join(" · ")}
        </div>
      </header>
      {p.summary && <Section title="Executive Summary" serif><p className="text-sm">{p.summary}</p></Section>}
      {content.experience.length > 0 && (
        <Section title="Experience" serif>
          {content.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="font-bold text-sm">{e.role}, {e.company}</div>
                <div className="text-xs text-zinc-500 italic">{e.startDate} – {e.endDate}</div>
              </div>
              {e.bullets.length > 0 && (
                <ul className="list-disc pl-4 text-sm space-y-0.5 mt-1">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
      {content.education.length > 0 && (
        <Section title="Education" serif>
          {content.education.map((ed) => (
            <div key={ed.id} className="mb-2 text-sm">
              <span className="font-semibold">{ed.degree}</span> · {ed.school} · {ed.startDate}–{ed.endDate}
            </div>
          ))}
        </Section>
      )}
      {content.skills.length > 0 && (
        <Section title="Core Competencies" serif>
          <div className="text-sm">{content.skills.join(" · ")}</div>
        </Section>
      )}
      {content.certifications && content.certifications.length > 0 && (
        <Section title="Certifications" serif>
          {content.certifications.map((c) => (
            <div key={c.id} className="mb-1 text-sm">
              <span className="font-bold">{c.name}</span>
              {c.issuer && <span> — {c.issuer}</span>}
              {c.date && <span className="italic text-zinc-500"> · {c.date}</span>}
            </div>
          ))}
        </Section>
      )}
      {content.languages && content.languages.length > 0 && (
        <Section title="Languages" serif>
          <div className="text-sm">
            {content.languages.map((l) => l.proficiency ? `${l.name} (${l.proficiency})` : l.name).join(" · ")}
          </div>
        </Section>
      )}
    </Sheet>
  );
});
ExecutiveTpl.displayName = "ExecutiveTpl";

function Section({ title, children, accent, serif }: { title: string; children: React.ReactNode; accent?: boolean; serif?: boolean }) {
  return (
    <section className="mb-4">
      <h2
        className={`text-xs font-semibold uppercase tracking-widest mb-2 pb-1 ${accent ? "text-emerald-700 border-b border-emerald-200" : serif ? "text-zinc-900 border-b border-zinc-300" : "text-zinc-500 border-b border-zinc-200"}`}
        style={serif ? { fontFamily: "Georgia, serif", letterSpacing: "0.15em" } : undefined}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}