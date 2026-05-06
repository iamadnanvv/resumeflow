import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export type AppStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export type ApplicationRow = {
  id?: string;
  company: string;
  role: string | null;
  job_url: string | null;
  job_description: string | null;
  status: AppStatus;
  applied_at: string | null;
  next_step_at: string | null;
  notes: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
};

const empty: ApplicationRow = {
  company: "", role: "", job_url: "", job_description: "",
  status: "saved", applied_at: null, next_step_at: null, notes: "",
  resume_id: null, cover_letter_id: null,
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ApplicationRow | null;
  onSaved: () => void;
};

export function ApplicationDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const { user } = useAuth();
  const [row, setRow] = useState<ApplicationRow>(empty);
  const [saving, setSaving] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    setRow(initial ? { ...empty, ...initial } : empty);
    (async () => {
      if (!user) return;
      const [{ data: r }, { data: l }] = await Promise.all([
        supabase.from("resumes").select("id,title").eq("user_id", user.id).order("updated_at", { ascending: false }),
        supabase.from("cover_letters").select("id,title").eq("user_id", user.id).order("updated_at", { ascending: false }),
      ]);
      setResumes(r || []);
      setLetters(l || []);
    })();
  }, [open, initial, user]);

  const save = async () => {
    if (!user) return;
    if (!row.company.trim()) { toast.error("Company is required"); return; }
    setSaving(true);
    const payload = {
      user_id: user.id,
      company: row.company.trim(),
      role: row.role?.trim() || null,
      job_url: row.job_url?.trim() || null,
      job_description: row.job_description?.trim() || null,
      status: row.status,
      applied_at: row.applied_at || null,
      next_step_at: row.next_step_at || null,
      notes: row.notes?.trim() || null,
      resume_id: row.resume_id || null,
      cover_letter_id: row.cover_letter_id || null,
    };
    const { error } = row.id
      ? await supabase.from("applications").update(payload).eq("id", row.id)
      : await supabase.from("applications").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(row.id ? "Application updated" : "Application added");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row.id ? "Edit application" : "New application"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Company *</Label>
              <Input value={row.company} onChange={(e) => setRow({ ...row, company: e.target.value })} placeholder="Acme Inc" />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Input value={row.role || ""} onChange={(e) => setRow({ ...row, role: e.target.value })} placeholder="Senior Engineer" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={row.status} onValueChange={(v: AppStatus) => setRow({ ...row, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Job URL</Label>
              <Input value={row.job_url || ""} onChange={(e) => setRow({ ...row, job_url: e.target.value })} placeholder="https://…" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Applied date</Label>
              <Input type="date" value={row.applied_at || ""} onChange={(e) => setRow({ ...row, applied_at: e.target.value || null })} />
            </div>
            <div>
              <Label className="text-xs">Next step</Label>
              <Input type="date" value={row.next_step_at || ""} onChange={(e) => setRow({ ...row, next_step_at: e.target.value || null })} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Linked resume</Label>
              <Select value={row.resume_id || "none"} onValueChange={(v) => setRow({ ...row, resume_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Linked cover letter</Label>
              <Select value={row.cover_letter_id || "none"} onValueChange={(v) => setRow({ ...row, cover_letter_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {letters.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Job description</Label>
            <Textarea rows={4} value={row.job_description || ""} onChange={(e) => setRow({ ...row, job_description: e.target.value })} placeholder="Paste the JD here for reference…" />
          </div>

          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea rows={3} value={row.notes || ""} onChange={(e) => setRow({ ...row, notes: e.target.value })} placeholder="Recruiter contact, interview prep, etc." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-gradient-primary text-primary-foreground">
              {saving ? "Saving…" : row.id ? "Save changes" : "Add application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
