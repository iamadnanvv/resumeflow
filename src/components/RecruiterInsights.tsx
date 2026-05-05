import { TrendingUp, Target, Clock, Eye } from "lucide-react";
import type { ResumeContent } from "@/lib/resume-types";

type Props = { content: ResumeContent };

// Heuristics from widely-cited resume best-practice guidance.
export function RecruiterInsights({ content }: Props) {
  const allBullets = content.experience.flatMap((e) => e.bullets);
  const totalBullets = allBullets.length;
  const quantified = allBullets.filter((b) => /\d/.test(b)).length;
  const quantPct = totalBullets ? Math.round((quantified / totalBullets) * 100) : 0;
  const avgBulletLen = totalBullets
    ? Math.round(allBullets.reduce((s, b) => s + b.split(/\s+/).length, 0) / totalBullets)
    : 0;
  const skillCount = content.skills.length;
  const summaryWords = content.personal.summary.trim().split(/\s+/).filter(Boolean).length;

  const insights: { icon: any; label: string; stat: string; tip: string; good: boolean }[] = [
    {
      icon: TrendingUp,
      label: "Quantified bullets",
      stat: `${quantPct}%`,
      tip:
        quantPct >= 60
          ? "Strong — measurable impact stands out to recruiters."
          : "Aim for 60%+. Add numbers (%, $, time, scale) to most bullets.",
      good: quantPct >= 60,
    },
    {
      icon: Target,
      label: "Bullet length",
      stat: avgBulletLen ? `${avgBulletLen} words` : "—",
      tip:
        avgBulletLen >= 12 && avgBulletLen <= 22
          ? "In the sweet spot (12–22 words)."
          : "Recruiters skim quickly — keep bullets 12–22 words for fast scanning.",
      good: avgBulletLen >= 12 && avgBulletLen <= 22,
    },
    {
      icon: Clock,
      label: "Summary length",
      stat: `${summaryWords} w`,
      tip:
        summaryWords >= 40 && summaryWords <= 90
          ? "Good — fits the F-pattern recruiters scan first."
          : "Aim for 40–90 words. Shorter loses context; longer gets skipped.",
      good: summaryWords >= 40 && summaryWords <= 90,
    },
    {
      icon: Eye,
      label: "Skill keywords",
      stat: `${skillCount}`,
      tip:
        skillCount >= 8 && skillCount <= 18
          ? "Optimal range for ATS keyword match."
          : "Most ATS reward 8–18 distinct, role-relevant skills.",
      good: skillCount >= 8 && skillCount <= 18,
    },
  ];

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recruiter insights
        </h3>
        <span className="text-[10px] text-muted-foreground">What works</span>
      </div>
      <ul className="space-y-2.5">
        {insights.map((it) => (
          <li key={it.label} className="flex gap-2.5">
            <div
              className={`mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${
                it.good ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <it.icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium">{it.label}</span>
                <span className={`text-xs font-semibold ${it.good ? "text-primary" : "text-foreground"}`}>
                  {it.stat}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground mt-0.5">{it.tip}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}