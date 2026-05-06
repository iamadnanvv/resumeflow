import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_SHARE_ORIGIN } from "@/lib/site";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  resumeId: string;
  title: string;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "resume";

export function SharePublicDialog({ open, onOpenChange, resumeId, title }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [slug, setSlug] = useState("");
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("resumes")
        .select("is_public, public_slug, public_view_count")
        .eq("id", resumeId)
        .maybeSingle();
      const r: any = data || {};
      setIsPublic(!!r.is_public);
      setSlug(r.public_slug || "");
      setViews(r.public_view_count || 0);

      const { count } = await supabase
        .from("resume_views")
        .select("id", { count: "exact", head: true })
        .eq("resume_id", resumeId);
      if (typeof count === "number") setViews(count);
      setLoading(false);
    })();
  }, [open, resumeId]);

  const ensureUniqueSlug = async (base: string) => {
    let candidate = base;
    let n = 0;
    // Try up to 5 variants
    while (n < 5) {
      const { data } = await supabase
        .from("resumes")
        .select("id")
        .eq("public_slug", candidate)
        .neq("id", resumeId)
        .maybeSingle();
      if (!data) return candidate;
      n += 1;
      candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }
    return `${base}-${Math.random().toString(36).slice(2, 8)}`;
  };

  const togglePublic = async (next: boolean) => {
    setSaving(true);
    let newSlug = slug;
    if (next && !newSlug) {
      newSlug = await ensureUniqueSlug(slugify(title || "resume"));
    }
    const { error } = await supabase
      .from("resumes")
      .update({ is_public: next, public_slug: next ? newSlug : slug || null })
      .eq("id", resumeId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setIsPublic(next);
    setSlug(newSlug);
    toast.success(next ? "Public link enabled" : "Resume is now private");
  };

  const renameSlug = async () => {
    const cleaned = slugify(slug);
    if (!cleaned) return toast.error("Slug cannot be empty");
    setSaving(true);
    const unique = await ensureUniqueSlug(cleaned);
    const { error } = await supabase
      .from("resumes")
      .update({ public_slug: unique })
      .eq("id", resumeId);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSlug(unique);
    toast.success("Link updated");
  };

  const fullUrl = slug ? `${PUBLIC_SHARE_ORIGIN}/r/${slug}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share public link</DialogTitle>
          <DialogDescription>Anyone with the link can view a read-only version of this resume.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium text-sm">Public access</div>
                <div className="text-xs text-muted-foreground">{isPublic ? "Anyone with the link can view" : "Only you can view"}</div>
              </div>
              <Switch checked={isPublic} onCheckedChange={togglePublic} disabled={saving} />
            </div>

            {isPublic && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Custom slug</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center rounded-md border bg-muted/40 px-3 text-xs text-muted-foreground">
                      <span className="hidden sm:inline">{PUBLIC_SHARE_ORIGIN.replace(/^https?:\/\//, "")}/r/</span>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="border-0 bg-transparent h-9 px-1 focus-visible:ring-0"
                      />
                    </div>
                    <Button size="sm" variant="outline" onClick={renameSlug} disabled={saving}>Save</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Shareable URL</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={fullUrl} className="text-xs" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("Link copied"); }}
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" asChild title="Open">
                      <a href={fullUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
                  <Eye className="h-4 w-4 text-primary" />
                  <span><span className="font-semibold">{views}</span> total view{views === 1 ? "" : "s"}</span>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
