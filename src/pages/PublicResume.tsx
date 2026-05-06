import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { emptyResume, type ResumeContent } from "@/lib/resume-types";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function PublicResume() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [template, setTemplate] = useState("minimal");
  const [title, setTitle] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("resumes")
        .select("id,title,template_slug,content,is_public,public_slug")
        .eq("public_slug", slug)
        .eq("is_public", true)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setLoading(false);
        return;
      }
      setContent({ ...emptyResume, ...(data.content as any) });
      setTemplate(data.template_slug || "minimal");
      setTitle(data.title || "Resume");
      setLoading(false);

      // Fire-and-forget view tracking (one per session per slug)
      try {
        const key = `rv:${slug}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          await supabase.from("resume_views").insert({
            resume_id: data.id,
            referrer: typeof document !== "undefined" ? document.referrer || null : null,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 255) : null,
          });
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <h1 className="font-display text-2xl font-semibold">Resume not found</h1>
        <p className="text-muted-foreground text-sm max-w-md">This resume link may have been removed or set to private by its owner.</p>
        <Link to="/"><Button variant="outline" size="sm">Build your own</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between">
          <Logo />
          <Link to="/">
            <Button size="sm" variant="outline">Build my resume</Button>
          </Link>
        </div>
      </header>
      <main className="py-8">
        <div className="mx-auto" style={{ maxWidth: "210mm" }}>
          <ResumePreview content={content} template={template} />
        </div>
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <span>{title} · Made with </span>
          <Link to="/" className="text-primary hover:underline">resumelylite</Link>
        </div>
      </main>
    </div>
  );
}
