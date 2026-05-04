import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logResumeCreation } from "@/lib/resume-tracking";
import type { ResumeContent } from "@/lib/resume-types";

const EXAMPLES = [
  "Senior frontend engineer, 6 years at fintech startups, led a design system used by 40 engineers, React/TypeScript expert, looking for staff roles.",
  "Recent CS grad from UT Austin, two internships at Meta and Stripe, built an open-source CLI with 2k stars, targeting new-grad SWE roles.",
  "Marketing manager, 8 years in B2B SaaS, grew MQLs 4x at last role, expert in HubSpot and lifecycle email, want to move into Director of Demand Gen.",
];

export function AiAssistantDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!user) { toast.error("Please sign in first."); return; }
    if (desc.trim().length < 10) { toast.error("Add a bit more detail (10+ characters)."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-resume", {
        body: { description: desc.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const content = data.content as ResumeContent;
      const title = (data.title as string) || "AI Generated Resume";

      const { data: row, error: insErr } = await supabase
        .from("resumes")
        .insert({ user_id: user.id, title, content: content as any })
        .select()
        .single();
      if (insErr) throw insErr;

      await logResumeCreation({
        resumeId: row.id,
        userId: user.id,
        source: "scratch",
        templateSlug: "minimal",
        metadata: { ai_generated: true, prompt_chars: desc.length },
      });

      toast.success("Resume generated — fine-tune in the builder.");
      setOpen(false);
      navigate(`/builder/${row.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Wand2 className="h-4 w-4" /> AI Assistant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> AI Resume Assistant
          </DialogTitle>
          <DialogDescription>
            Describe your background, target role, and standout achievements. The AI will draft a complete, ATS-friendly resume.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value.slice(0, 2000))}
          placeholder="e.g. Senior data scientist, 5 years at e-commerce companies, built recommendation systems serving 10M users, Python/SQL/PyTorch, targeting Principal DS roles..."
          rows={8}
          disabled={loading}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{desc.length}/2000</span>
          {profile?.plan === "free" && <span>Free plan: 1 resume total</span>}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Try an example:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDesc(ex)}
                disabled={loading}
                className="text-xs rounded-full border px-3 py-1.5 hover:bg-accent transition text-left max-w-full truncate"
                title={ex}
              >
                {ex.slice(0, 60)}…
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={generate} disabled={loading || desc.trim().length < 10} className="gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Wand2 className="h-4 w-4" /> Generate resume</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}