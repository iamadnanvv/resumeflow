import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, MailCheck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mirrors edge function: .edu, .edu.<cc>, .ac, .ac.<cc>, .sch.<cc>, .sch.ac.<cc>, k12.<state>.us
const CAMPUS_PATTERNS = [
  /(^|\.)edu(\.[a-z]{2,})?$/i,
  /(^|\.)ac(\.[a-z]{2,})?$/i,
  /(^|\.)sch(\.[a-z]{2,})?$/i,
  /(^|\.)k12\.[a-z]{2}\.us$/i,
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onVerified: () => void;
  kind?: "student" | "teacher";
};

export function StudentVerifyDialog({ open, onOpenChange, onVerified, kind = "student" }: Props) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("email");
      setEmail("");
      setCode("");
    }
  }, [open]);

  const validEmail = (e: string) => {
    const trimmed = e.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false;
    const domain = trimmed.split("@")[1] || "";
    return CAMPUS_PATTERNS.some((re) => re.test(domain));
  };

  const sendCode = async () => {
    if (!validEmail(email)) {
      toast.error("Enter a campus email (.edu, .edu.in, .ac.in, .ac.uk, .sch.uk, etc.)");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("student-verify-request", {
        body: { email: email.trim().toLowerCase(), kind },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Verification code sent. Check your campus inbox.");
      setStep("code");
    } catch (e: any) {
      toast.error(e.message || "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("student-verify-confirm", {
        body: { email: email.trim().toLowerCase(), code },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`${kind === "teacher" ? "Teacher" : "Student"} status verified 🎓`);
      onVerified();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-2xl w-fit mb-2">
            <GraduationCap className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            Verify your {kind === "teacher" ? "teacher" : "student"} status
          </DialogTitle>
          <DialogDescription className="text-center">
            Use your campus email (.edu, .edu.in, .ac.in, .ac.uk, .sch.uk, etc.) to unlock {kind} pricing.
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <div className="space-y-3 mt-2">
            <Label htmlFor="campus-email">Campus email</Label>
            <Input
              id="campus-email"
              type="email"
              autoComplete="email"
              maxLength={255}
              placeholder="you@yourcollege.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
            />
            <Button className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={sendCode} disabled={loading}>
              <MailCheck className="h-4 w-4 mr-2" />
              {loading ? "Sending…" : "Send verification code"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We'll email a 6-digit code that expires in 10 minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            <div className="text-sm text-muted-foreground">
              Code sent to <span className="font-medium text-foreground">{email}</span>
            </div>
            <Label htmlFor="campus-code">6-digit code</Label>
            <Input
              id="campus-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              className="text-center tracking-[0.5em] text-lg font-mono"
            />
            <Button className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={confirm} disabled={loading}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              {loading ? "Verifying…" : "Verify & continue"}
            </Button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Use a different email
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}