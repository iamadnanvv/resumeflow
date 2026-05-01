import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { anonymizeResume } from "@/lib/resume-tracking";
import type { ResumeContent } from "@/lib/resume-types";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  resumeId: string;
  content: ResumeContent;
  defaultTitle?: string;
};

export function ShowcaseSubmitDialog({ open, onOpenChange, resumeId, content, defaultTitle }: Props) {
  const [title, setTitle] = useState(defaultTitle || content.personal.title || "");
  const [industry, setIndustry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim()) return toast.error("Please add a short title");
    setSubmitting(true);
    try {
      const anon = anonymizeResume(content);
      const { error } = await supabase
        .from("resumes")
        .update({
          showcase_status: "submitted",
          showcase_title: title.trim(),
          showcase_industry: industry.trim() || null,
          showcase_anonymized_content: anon as any,
          showcase_submitted_at: new Date().toISOString(),
        } as any)
        .eq("id", resumeId);
      if (error) throw error;
      toast.success("Submitted! Our team will review and curate your resume.");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Could not submit");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-2 w-fit">
            <Sparkles className="h-3 w-3" /> Resume Copycat
          </div>
          <DialogTitle>Submit to public showcase</DialogTitle>
          <DialogDescription>
            We'll anonymize your resume (name, email, phone, links, exact employer names) and an admin will review before
            it appears on <strong>/showcase</strong>. Your original resume stays private.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="ss-title">Short title</Label>
            <Input id="ss-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Product Designer · 7 yrs" />
          </div>
          <div>
            <Label htmlFor="ss-industry">Industry / role family (optional)</Label>
            <Input id="ss-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Design · SaaS" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Submit for review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}