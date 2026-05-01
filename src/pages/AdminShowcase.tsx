import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { anonymizeResume } from "@/lib/resume-tracking";
import type { ResumeContent } from "@/lib/resume-types";
import { Check, X, Eye, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  user_id: string;
  title: string;
  template_slug: string;
  ats_score: number | null;
  content: ResumeContent;
  showcase_status: "none" | "submitted" | "approved" | "rejected";
  showcase_title: string | null;
  showcase_industry: string | null;
  showcase_anonymized_content: ResumeContent | null;
  showcase_admin_notes: string | null;
  showcase_submitted_at: string | null;
};

export default function AdminShowcase() {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"submitted" | "approved" | "rejected">("submitted");
  const [reviewing, setReviewing] = useState<Row | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editAnon, setEditAnon] = useState<ResumeContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/dashboard");
  }, [authLoading, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("resumes")
      .select("id, user_id, title, template_slug, ats_score, content, showcase_status, showcase_title, showcase_industry, showcase_anonymized_content, showcase_admin_notes, showcase_submitted_at")
      .in("showcase_status", ["submitted", "approved", "rejected"])
      .order("showcase_submitted_at", { ascending: false, nullsFirst: false });
    setRows((data || []) as any);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const open = (r: Row) => {
    setReviewing(r);
    setEditTitle(r.showcase_title || r.content.personal.title || "");
    setEditIndustry(r.showcase_industry || "");
    setEditNotes(r.showcase_admin_notes || "");
    setEditAnon(r.showcase_anonymized_content || anonymizeResume(r.content));
  };

  const reAnonymize = () => {
    if (!reviewing) return;
    setEditAnon(anonymizeResume(reviewing.content));
    toast.success("Re-anonymized from original");
  };

  const save = async (status: "approved" | "rejected" | "submitted") => {
    if (!reviewing || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("resumes")
        .update({
          showcase_status: status,
          showcase_title: editTitle.trim() || null,
          showcase_industry: editIndustry.trim() || null,
          showcase_anonymized_content: editAnon as any,
          showcase_admin_notes: editNotes.trim() || null,
          showcase_reviewed_at: new Date().toISOString(),
          showcase_reviewed_by: user.id,
        } as any)
        .eq("id", reviewing.id);
      if (error) throw error;
      toast.success(status === "approved" ? "Published to showcase" : status === "rejected" ? "Rejected" : "Saved");
      setReviewing(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Could not save");
    } finally { setSaving(false); }
  };

  const filtered = rows.filter((r) => r.showcase_status === tab);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Showcase curation</h1>
            <p className="text-sm text-muted-foreground mt-1">Review user submissions, anonymize, and publish to the public showcase.</p>
          </div>
          <a href="/admin/audit" className="text-sm text-primary hover:underline">← Creation audit</a>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-6">
          <TabsList>
            <TabsTrigger value="submitted">Pending ({rows.filter((r) => r.showcase_status === "submitted").length})</TabsTrigger>
            <TabsTrigger value="approved">Published ({rows.filter((r) => r.showcase_status === "approved").length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rows.filter((r) => r.showcase_status === "rejected").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {loading ? (
              <div className="py-16 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Nothing here yet.</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filtered.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-card p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.showcase_title || r.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.showcase_industry || "—"}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="capitalize text-xs">{r.template_slug}</Badge>
                        {r.ats_score != null && <span className="text-xs text-muted-foreground">ATS {r.ats_score}</span>}
                        {r.showcase_submitted_at && <span className="text-xs text-muted-foreground">· {new Date(r.showcase_submitted_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => open(r)}><Eye className="h-3.5 w-3.5 mr-1" /> Review</Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!reviewing} onOpenChange={(v) => !v && setReviewing(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review submission</DialogTitle>
          </DialogHeader>
          {reviewing && editAnon && (
            <div className="grid lg:grid-cols-[360px_1fr] gap-6">
              <div className="space-y-3">
                <div>
                  <Label>Showcase title</Label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Industry / role family</Label>
                  <Input value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} />
                </div>
                <div>
                  <Label>Admin notes (private)</Label>
                  <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
                </div>
                <Button variant="outline" size="sm" onClick={reAnonymize} className="w-full">
                  <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Re-anonymize from original
                </Button>
                <div className="rounded-lg border p-3 bg-muted/30 text-xs space-y-1">
                  <div className="font-medium">Anonymized preview fields</div>
                  <div>Name: <span className="text-muted-foreground">{editAnon.personal.fullName}</span></div>
                  <div>Email: <span className="text-muted-foreground">{editAnon.personal.email || "—"}</span></div>
                  <div>Phone: <span className="text-muted-foreground">{editAnon.personal.phone || "—"}</span></div>
                  <div>First employer: <span className="text-muted-foreground">{editAnon.experience[0]?.company || "—"}</span></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => save("rejected")} variant="outline" disabled={saving} className="flex-1">
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                  <Button onClick={() => save("approved")} disabled={saving} className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                    Approve & publish
                  </Button>
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 overflow-auto max-h-[70vh] flex justify-center">
                <div className="origin-top scale-[0.6]">
                  <ResumePreview content={editAnon} template={reviewing.template_slug} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  );
}