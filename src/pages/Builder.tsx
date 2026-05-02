import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeContent, emptyResume } from "@/lib/resume-types";
import { scoreResume } from "@/lib/resume-score";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/Logo";
import { Loader2, Plus, Trash2, Download, Sparkles, ArrowLeft, GripVertical, Wand2, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { ShowcaseSubmitDialog } from "@/components/ShowcaseSubmitDialog";
import { RecruiterInsights } from "@/components/RecruiterInsights";
import { LinkedInImportDialog } from "@/components/LinkedInImportDialog";
import { Linkedin } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 9);

export default function Builder() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("minimal");
  const [content, setContent] = useState<ResumeContent>(emptyResume);
  const [showcaseStatus, setShowcaseStatus] = useState<"none" | "submitted" | "approved" | "rejected">("none");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [linkedInOpen, setLinkedInOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", id!).single();
      if (error) { toast.error("Resume not found"); navigate("/dashboard"); return; }
      setTitle(data.title);
      setTemplate(data.template_slug);
      setContent({ ...emptyResume, ...(data.content as any) });
      setShowcaseStatus(((data as any).showcase_status as any) || "none");
      setLoading(false);
    })();
  }, [id, navigate]);

  const { score, tips } = scoreResume(content);

  // Autosave (debounced)
  const save = useCallback(async () => {
    setSaving(true);
    const { error } = await supabase
      .from("resumes")
      .update({ title, template_slug: template, content: content as any, ats_score: score })
      .eq("id", id!);
    setSaving(false);
    if (error) toast.error(error.message);
  }, [title, template, content, id, score]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(save, 1200);
    return () => clearTimeout(t);
  }, [content, title, template, loading, save]);

  const exportPDF = async () => {
    if (!previewRef.current) return;
    if (profile?.plan !== "pro" && profile?.plan !== "premium") {
      toast.error("PDF download is a Pro feature — upgrade to download.");
      navigate("/pricing");
      return;
    }
    setExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgH = pageW * ratio;
      let position = 0;
      let heightLeft = imgH;
      pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(img, "JPEG", 0, position, pageW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(`${title || "resume"}.pdf`);
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const callAI = async (mode: string, payload: any, key: string) => {
    setAiLoading(key);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", { body: { mode, payload } });
      if (error) throw error;
      // Best-effort: log AI assist usage for this resume (admin audit)
      if (id) supabase.rpc("increment_ai_assist", { _resume_id: id } as any).then(() => {}, () => {});
      return data?.text as string;
    } catch (e: any) {
      toast.error(e.message?.includes("402") ? "AI credits exhausted" : "AI request failed");
      return null;
    } finally {
      setAiLoading(null);
    }
  };

  const aiSummary = async () => {
    const text = await callAI("summary", { personal: content.personal, experience: content.experience }, "summary");
    if (text) setContent((c) => ({ ...c, personal: { ...c.personal, summary: text } }));
  };

  const aiBullets = async (expIdx: number) => {
    const exp = content.experience[expIdx];
    const text = await callAI("bullets", { role: exp.role, company: exp.company, existing: exp.bullets }, `bullets-${expIdx}`);
    if (text) {
      const bullets = text.split("\n").map((l) => l.replace(/^[-•*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 5);
      setContent((c) => {
        const ex = [...c.experience];
        ex[expIdx] = { ...ex[expIdx], bullets };
        return { ...c, experience: ex };
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const isPremiumTemplate = template === "executive" || template === "creative";
  const canUsePremium = profile?.plan !== "free";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b sticky top-0 z-30">
        <div className="container h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <Logo size="sm" />
            <div className="h-5 w-px bg-border" />
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 border-0 focus-visible:ring-1 max-w-xs font-medium" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{saving ? "Saving…" : "Saved"}</span>
            <Select value={template} onValueChange={(v) => {
              if ((v === "executive" || v === "creative") && !canUsePremium) {
                toast.error("Premium template — upgrade to Pro");
                return;
              }
              setTemplate(v);
            }}>
              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="executive">Executive ★</SelectItem>
              </SelectContent>
            </Select>
            {profile?.plan === "pro" || profile?.plan === "premium" ? (
              <Button onClick={exportPDF} disabled={exporting} className="bg-gradient-primary text-primary-foreground hover:opacity-90" size="sm">
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="ml-1.5 hidden sm:inline">PDF</span>
              </Button>
            ) : (
              <Button onClick={() => navigate("/pricing")} className="bg-gradient-primary text-primary-foreground hover:opacity-90" size="sm">
                <Lock className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline">Download (Pro)</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSubmitOpen(true)}
              disabled={showcaseStatus === "submitted" || showcaseStatus === "approved"}
              title={showcaseStatus === "approved" ? "Already published to showcase" : showcaseStatus === "submitted" ? "Pending admin review" : "Submit anonymized to public showcase"}
            >
              <Share2 className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">
                {showcaseStatus === "approved" ? "In showcase" : showcaseStatus === "submitted" ? "In review" : "Showcase"}
              </span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setLinkedInOpen(true)} title="Import from LinkedIn export">
              <Linkedin className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">LinkedIn</span>
            </Button>
          </div>
        </div>
      </header>

      {id && (
        <ShowcaseSubmitDialog
          open={submitOpen}
          onOpenChange={(v) => { setSubmitOpen(v); if (!v) (async () => { const { data } = await supabase.from("resumes").select("showcase_status").eq("id", id).maybeSingle(); if (data) setShowcaseStatus((data as any).showcase_status || "none"); })(); }}
          resumeId={id}
          content={content}
          defaultTitle={content.personal.title}
        />
      )}

      <LinkedInImportDialog
        open={linkedInOpen}
        onOpenChange={setLinkedInOpen}
        onImport={(r) => setContent({ ...emptyResume, ...r })}
      />

      <div className="flex-1 grid lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr]">
        {/* Left: Editor */}
        <aside className="border-r overflow-y-auto max-h-[calc(100vh-3.5rem)] p-6 space-y-6">
          {/* Score */}
          <div className="rounded-xl glass p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">ATS Score</span>
              <span className="text-3xl font-display font-semibold text-primary">{score}<span className="text-sm text-muted-foreground">/100</span></span>
            </div>
            <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all" style={{ width: `${score}%` }} />
            </div>
            {tips.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {tips.slice(0, 3).map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            )}
          </div>

          {/* Recruiter insights — what works */}
          <RecruiterInsights content={content} />

          {/* Personal */}
          <Section title="Personal">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name" v={content.personal.fullName} on={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, fullName: v } }))} className="col-span-2" />
              <Field label="Title" v={content.personal.title} on={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, title: v } }))} className="col-span-2" />
              <Field label="Email" v={content.personal.email} on={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, email: v } }))} />
              <Field label="Phone" v={content.personal.phone} on={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, phone: v } }))} />
              <Field label="Location" v={content.personal.location} on={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, location: v } }))} />
              <Field label="Website" v={content.personal.website} on={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, website: v } }))} />
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <Label>Summary</Label>
                <Button size="sm" variant="ghost" onClick={aiSummary} disabled={aiLoading === "summary"} className="h-7 text-xs text-primary">
                  {aiLoading === "summary" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                  <span className="ml-1">AI write</span>
                </Button>
              </div>
              <Textarea value={content.personal.summary} onChange={(e) => setContent((c) => ({ ...c, personal: { ...c.personal, summary: e.target.value } }))} rows={4} />
            </div>
          </Section>

          {/* Experience */}
          <Section
            title="Experience"
            action={
              <Button size="sm" variant="ghost" onClick={() =>
                setContent((c) => ({ ...c, experience: [...c.experience, { id: uid(), role: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] }] }))
              }><Plus className="h-3.5 w-3.5" /> Add</Button>
            }
          >
            <DragDropContext onDragEnd={(r) => {
              if (!r.destination) return;
              setContent((c) => {
                const items = [...c.experience];
                const [m] = items.splice(r.source.index, 1);
                items.splice(r.destination!.index, 0, m);
                return { ...c, experience: items };
              });
            }}>
              <Droppable droppableId="exp">
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.droppableProps} className="space-y-3">
                    {content.experience.map((e, i) => (
                      <Draggable key={e.id} draggableId={e.id} index={i}>
                        {(p) => (
                          <div ref={p.innerRef} {...p.draggableProps} className="rounded-lg border bg-card p-3 space-y-2">
                            <div className="flex items-center gap-2">
                              <span {...p.dragHandleProps} className="text-muted-foreground cursor-grab"><GripVertical className="h-4 w-4" /></span>
                              <Field placeholder="Role" v={e.role} on={(v) => updateExp(setContent, i, { role: v })} className="flex-1" />
                              <Button size="icon" variant="ghost" onClick={() => setContent((c) => ({ ...c, experience: c.experience.filter((_, ix) => ix !== i) }))}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Field placeholder="Company" v={e.company} on={(v) => updateExp(setContent, i, { company: v })} />
                              <Field placeholder="Location" v={e.location} on={(v) => updateExp(setContent, i, { location: v })} />
                              <Field placeholder="Start" v={e.startDate} on={(v) => updateExp(setContent, i, { startDate: v })} />
                              <Field placeholder="End" v={e.endDate} on={(v) => updateExp(setContent, i, { endDate: v })} />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <Label className="text-xs">Bullets</Label>
                                <Button size="sm" variant="ghost" onClick={() => aiBullets(i)} disabled={aiLoading === `bullets-${i}`} className="h-6 text-xs text-primary">
                                  {aiLoading === `bullets-${i}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                  <span className="ml-1">Improve</span>
                                </Button>
                              </div>
                              {e.bullets.map((b, bi) => (
                                <div key={bi} className="flex gap-1 mb-1">
                                  <Textarea value={b} onChange={(ev) => {
                                    const bullets = [...e.bullets]; bullets[bi] = ev.target.value;
                                    updateExp(setContent, i, { bullets });
                                  }} rows={2} className="text-xs" />
                                  <Button size="icon" variant="ghost" onClick={() => updateExp(setContent, i, { bullets: e.bullets.filter((_, x) => x !== bi) })}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                              ))}
                              <Button size="sm" variant="outline" onClick={() => updateExp(setContent, i, { bullets: [...e.bullets, ""] })} className="w-full h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Bullet</Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Section>

          {/* Education */}
          <Section title="Education" action={
            <Button size="sm" variant="ghost" onClick={() => setContent((c) => ({ ...c, education: [...c.education, { id: uid(), degree: "", school: "", startDate: "", endDate: "", description: "" }] }))}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          }>
            {content.education.map((ed, i) => (
              <div key={ed.id} className="rounded-lg border bg-card p-3 space-y-2 mb-2">
                <div className="flex gap-2">
                  <Field placeholder="Degree" v={ed.degree} on={(v) => updateArr(setContent, "education", i, { degree: v })} className="flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => setContent((c) => ({ ...c, education: c.education.filter((_, ix) => ix !== i) }))}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                <Field placeholder="School" v={ed.school} on={(v) => updateArr(setContent, "education", i, { school: v })} />
                <div className="grid grid-cols-2 gap-2">
                  <Field placeholder="Start" v={ed.startDate} on={(v) => updateArr(setContent, "education", i, { startDate: v })} />
                  <Field placeholder="End" v={ed.endDate} on={(v) => updateArr(setContent, "education", i, { endDate: v })} />
                </div>
              </div>
            ))}
          </Section>

          {/* Skills */}
          <Section title="Skills">
            <Textarea
              placeholder="React, TypeScript, AWS, …"
              value={content.skills.join(", ")}
              onChange={(e) => setContent((c) => ({ ...c, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated.</p>
          </Section>

          {/* Projects */}
          <Section title="Projects" action={
            <Button size="sm" variant="ghost" onClick={() => setContent((c) => ({ ...c, projects: [...c.projects, { id: uid(), name: "", link: "", description: "" }] }))}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          }>
            {content.projects.map((pr, i) => (
              <div key={pr.id} className="rounded-lg border bg-card p-3 space-y-2 mb-2">
                <div className="flex gap-2">
                  <Field placeholder="Name" v={pr.name} on={(v) => updateArr(setContent, "projects", i, { name: v })} className="flex-1" />
                  <Button size="icon" variant="ghost" onClick={() => setContent((c) => ({ ...c, projects: c.projects.filter((_, ix) => ix !== i) }))}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                <Field placeholder="Link" v={pr.link} on={(v) => updateArr(setContent, "projects", i, { link: v })} />
                <Textarea placeholder="Description" value={pr.description} onChange={(e) => updateArr(setContent, "projects", i, { description: e.target.value })} rows={2} />
              </div>
            ))}
          </Section>
        </aside>

        {/* Right: Preview */}
        <main className="bg-muted/30 overflow-auto max-h-[calc(100vh-3.5rem)] p-6 lg:p-10 flex justify-center">
          <div className="origin-top scale-[0.7] xl:scale-[0.85]">
            <ResumePreview ref={previewRef} content={content} template={template} />
          </div>
        </main>
      </div>
    </div>
  );
}

function updateExp(setContent: any, i: number, patch: any) {
  setContent((c: ResumeContent) => {
    const ex = [...c.experience];
    ex[i] = { ...ex[i], ...patch };
    return { ...c, experience: ex };
  });
}
function updateArr(setContent: any, key: "education" | "projects", i: number, patch: any) {
  setContent((c: ResumeContent) => {
    const arr = [...(c as any)[key]];
    arr[i] = { ...arr[i], ...patch };
    return { ...c, [key]: arr } as ResumeContent;
  });
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, v, on, className, placeholder }: { label?: string; v: string; on: (v: string) => void; className?: string; placeholder?: string }) {
  return (
    <div className={className}>
      {label && <Label className="text-xs">{label}</Label>}
      <Input value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );
}