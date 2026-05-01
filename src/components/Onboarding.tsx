import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { emptyResume } from "@/lib/resume-types";
import { toast } from "sonner";
import { logResumeCreation } from "@/lib/resume-tracking";
import { Loader2, ArrowRight, Sparkles, Check, GraduationCap, Briefcase, BookOpen } from "lucide-react";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

const GOALS = [
  { id: "new-job", label: "Land a new job" },
  { id: "promotion", label: "Get promoted" },
  { id: "career-switch", label: "Switch careers" },
  { id: "first-job", label: "First job / internship" },
];

const USER_TYPES = [
  { id: "student", label: "Student", icon: GraduationCap, hint: "Unlock student pricing with a campus email." },
  { id: "professional", label: "Working professional", icon: Briefcase, hint: "Tools for career growth & switching." },
  { id: "teacher", label: "Teacher / Educator", icon: BookOpen, hint: "Academic CV templates & teacher pricing." },
] as const;

export function Onboarding({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [userType, setUserType] = useState<"student" | "professional" | "teacher" | "">("");
  const [goal, setGoal] = useState<string>("new-job");
  const [creating, setCreating] = useState(false);

  const reset = () => { setStep(1); setFullName(""); setRole(""); setUserType(""); setGoal("new-job"); };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const next = () => {
    if (step === 1 && !fullName.trim()) return toast.error("Enter your name");
    if (step === 2 && !userType) return toast.error("Pick one to continue");
    if (step === 3 && !role.trim()) return toast.error("Enter your role");
    setStep((s) => s + 1);
  };

  const finish = async () => {
    if (!user) { toast.error("Loading session, try again"); return; }
    setCreating(true);
    try {
      // Save user_type on profile (best-effort; non-blocking on failure)
      if (userType) {
        await supabase.from("profiles").update({ user_type: userType as any }).eq("id", user.id);
      }
      const seed = {
        ...emptyResume,
        personal: { ...emptyResume.personal, fullName: fullName.trim(), title: role.trim() },
      };
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: `${fullName.trim()}'s Resume`,
          template_slug: "modern",
          content: seed as any,
        })
        .select()
        .single();
      if (error) throw error;
      await logResumeCreation({
        resumeId: data.id,
        userId: user.id,
        source: "onboarding",
        templateSlug: "modern",
        metadata: { goal, user_type: userType, role: role.trim() },
      });
      toast.success("Resume created — let's build it!");
      onOpenChange(false);
      navigate(`/builder/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Could not create resume");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-3 w-fit">
            <Sparkles className="h-3 w-3" /> Step {step} of 4 · ~60 seconds
          </div>
          <DialogTitle className="font-display text-2xl">
            {step === 1 && "What's your name?"}
            {step === 2 && "Which best describes you?"}
            {step === 3 && "What role are you targeting?"}
            {step === 4 && "What's your goal?"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "We'll prefill it on your resume — you can change anything later."}
            {step === 2 && "We'll tailor pricing and templates for you."}
            {step === 3 && "E.g. Senior Product Designer, Frontend Engineer."}
            {step === 4 && "We'll tailor AI suggestions to match."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="ob-name">Full name</Label>
              <Input
                id="ob-name"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && next()}
                placeholder="Alex Morgan"
              />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-2">
              {USER_TYPES.map((t) => {
                const Icon = t.icon;
                const active = userType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setUserType(t.id)}
                    className={`w-full flex items-start gap-3 text-left rounded-lg border px-3 py-3 text-sm transition ${
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-muted-foreground">{t.hint}</div>
                    </div>
                    {active && <Check className="h-4 w-4 text-primary mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="ob-role">Target role</Label>
              <Input
                id="ob-role"
                autoFocus
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && next()}
                placeholder="Senior Product Designer"
              />
            </div>
          )}
          {step === 4 && (
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`flex items-center justify-between text-left rounded-lg border px-3 py-3 text-sm transition ${
                    goal === g.id
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span>{g.label}</span>
                  {goal === g.id && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-2">
          <Button
            variant="ghost"
            onClick={() => (step === 1 ? handleClose(false) : setStep((s) => s - 1))}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 4 ? (
            <Button
              onClick={next}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={finish}
              disabled={creating}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              {creating && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Open my builder <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}