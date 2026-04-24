import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Loader2, Wand2, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function CoverLetter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("cover_letters").select("*").eq("id", id!).single();
      if (error) { toast.error("Not found"); navigate("/dashboard"); return; }
      setTitle(data.title); setJobTitle(data.job_title || ""); setCompany(data.company || ""); setContent(data.content || "");
      setLoading(false);
    })();
  }, [id, navigate]);

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      setSaving(true);
      await supabase.from("cover_letters").update({ title, job_title: jobTitle, company, content }).eq("id", id!);
      setSaving(false);
    }, 1000);
    return () => clearTimeout(t);
  }, [title, jobTitle, company, content, loading, id]);

  const generate = async () => {
    setAiLoading(true);
    try {
      // Use most recent resume as context
      const { data: { user } } = await supabase.auth.getUser();
      const { data: resumes } = await supabase.from("resumes").select("content").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(1);
      const resumeContent = resumes?.[0]?.content;
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: { mode: "cover_letter", payload: { jobTitle, company, resumeContent } }
      });
      if (error) throw error;
      setContent(data.text);
    } catch (e: any) {
      toast.error("AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const exportPDF = () => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const lines = pdf.splitTextToSize(content, 170);
    pdf.text(lines, 20, 25);
    pdf.save(`${title || "cover-letter"}.pdf`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b sticky top-0 z-30">
        <div className="container h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild><Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <Logo size="sm" />
            <div className="h-5 w-px bg-border" />
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 border-0 focus-visible:ring-1 max-w-xs font-medium" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">{saving ? "Saving…" : "Saved"}</span>
            <Button onClick={exportPDF} size="sm" variant="outline"><Download className="h-4 w-4" /><span className="ml-1.5">PDF</span></Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container max-w-3xl py-10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Job title</Label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Engineer" /></div>
          <div><Label>Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc" /></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Letter</Label>
            <Button size="sm" onClick={generate} disabled={aiLoading || !jobTitle || !company} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Wand2 className="h-3.5 w-3.5 mr-1.5" />}
              Generate with AI
            </Button>
          </div>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} className="font-mono text-sm" />
        </div>
      </main>
    </div>
  );
}