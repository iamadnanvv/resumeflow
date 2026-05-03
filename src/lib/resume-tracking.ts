import { supabase } from "@/integrations/supabase/client";
import type { ResumeContent } from "./resume-types";

export type CreationSource = "scratch" | "template" | "onboarding" | "cloned_showcase" | "imported";

/** Best-effort: log how a resume was created. Never throws. */
export async function logResumeCreation(params: {
  resumeId: string;
  userId: string;
  source: CreationSource;
  templateSlug?: string;
  clonedFromResumeId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await supabase.from("resume_creation_events").insert({
      resume_id: params.resumeId,
      user_id: params.userId,
      source: params.source,
      template_slug: params.templateSlug ?? null,
      cloned_from_resume_id: params.clonedFromResumeId ?? null,
      metadata: params.metadata ?? {},
      ai_assist_count: 0,
    } as any);
  } catch (e) {
    console.warn("logResumeCreation failed", e);
  }
}

/** Strip personal identifiers from resume content for showcase. */
export function anonymizeResume(content: ResumeContent): ResumeContent {
  return {
    ...content,
    personal: {
      fullName: "Anonymous Candidate",
      title: content.personal.title || "",
      email: "",
      phone: "",
      location: content.personal.location?.split(",").slice(-1)[0]?.trim() || "",
      website: "",
      summary: content.personal.summary || "",
    },
    experience: content.experience.map((e) => ({
      ...e,
      company: maskCompany(e.company),
      location: "",
    })),
    education: content.education.map((ed) => ({
      ...ed,
      school: maskCompany(ed.school),
    })),
    projects: content.projects.map((pr) => ({
      ...pr,
      link: "",
    })),
  };
}

function maskCompany(name: string): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (trimmed.length <= 2) return "•••";
  return trimmed[0] + "•••" + (trimmed.length > 4 ? trimmed[trimmed.length - 1] : "");
}

/** Returns a structure-only template from a showcase resume (no bullets/summary). */
export function showcaseToTemplate(content: ResumeContent): ResumeContent {
  return {
    personal: { fullName: "", title: content.personal.title || "", email: "", phone: "", location: "", website: "", summary: "" },
    experience: content.experience.map((e) => ({
      id: Math.random().toString(36).slice(2, 9),
      role: e.role || "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    })),
    education: content.education.map((ed) => ({
      id: Math.random().toString(36).slice(2, 9),
      degree: ed.degree || "",
      school: "",
      startDate: "",
      endDate: "",
      description: "",
    })),
    skills: [...content.skills],
    projects: content.projects.map(() => ({
      id: Math.random().toString(36).slice(2, 9),
      name: "",
      link: "",
      description: "",
    })),
    certifications: content.certifications?.map(() => ({
      id: Math.random().toString(36).slice(2, 9),
      name: "",
      issuer: "",
      date: "",
      link: "",
    })) ?? [],
    languages: content.languages?.map(() => ({
      id: Math.random().toString(36).slice(2, 9),
      name: "",
      proficiency: "",
    })) ?? [],
  };
}