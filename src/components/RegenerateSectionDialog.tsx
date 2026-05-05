import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ResumeContent } from "@/lib/resume-types";

export type SectionPatch = {
  summary?: string;
  skills?: string[];
  experience?: ResumeContent["experience"];
};

type Section = "summary" | "skills" | "experience";

const LABELS: Record<Section, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
};

const PLACEHOLDERS: Record<Section, string> = {
  summary: "e.g. Senior PM, 8 years in B2B SaaS, shipped AI features used by 200k users — targeting Director of Product roles.",
  skills: "e.g. Frontend engineer focused on React, accessibility, and performance — list relevant tools.",
  experience: "e.g. 6 years at fintech startups, led platform team of 5, owned design system and CI/CD.",
};

export function RegenerateSectionDialog({
  open,
  onOpenChange,
  section,
  currentContent,
  onApply,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  section: Section;
  currentContent: ResumeContent;
  onApply: (patch: SectionPatch) => void;
}) {
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const seedFromResume = () => {
    const p = currentContent.personal;
    const seed = [
      p.title && `Target role: ${p.title}.`,
      p.summary && `Background: ${p.summary}`,
      currentContent.experience.length > 0 &&
        `Recent roles: ${currentContent.experience.slice(0, 3).map((e) => `${e.role} at ${e.company}`).join("; ")}.`,
      currentContent.skills.length > 0 && `Current skills: ${currentContent.skills.slice(0, 10).join(", ")}.`,
    ].filter(Boolean).join(" ");
    if (seed) setDesc(seed);
  };

  const run = async () => {
    if (desc.trim().length < 10) { toast.error("Add a bit more detail (10+ characters)."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-regenerate-section", {
        body: { description: desc.trim(), section },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onApply(data as SectionPatch);
      toast.success(`${LABELS[section]} regenerated — rest of resume preserved.`);
      onOpenChange(false);
      setDesc("");
    } catch (e: any) {
      const msg = e?.message ?? "Regeneration failed";
      if (msg.includes("402") || msg.toLowerCase().includes("credits exhausted")) {
        toast.error("AI credits exhausted — add credits in workspace settings.");
      } else if (msg.includes("429") || msg.toLowerCase().includes("rate")) {
        toast.error("Rate limited — try again in a minute.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" /> Regenerate {LABELS[section]}
          </DialogTitle>
          <DialogDescription>
            Describe what you want. Only the <strong>{LABELS[section]}</strong> section will be replaced — the rest of your resume stays intact.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value.slice(0, 2000))}
          placeholder={PLACEHOLDERS[section]}
          rows={6}
          disabled={loading}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button type="button" onClick={seedFromResume} disabled={loading} className="text-primary hover:underline">
            Use my current resume as context
          </button>
          <span>{desc.length}/2000</span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={run} disabled={loading || desc.trim().length < 10} className="gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Regenerating…</> : <><RefreshCw className="h-4 w-4" /> Regenerate {LABELS[section]}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}