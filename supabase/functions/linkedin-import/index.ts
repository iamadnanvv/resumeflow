import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => null);
    const text: string | undefined = body?.text;
    if (!text || typeof text !== "string" || text.length < 50) {
      return json({ error: "Provide pasted LinkedIn export text (min 50 chars)" }, 400);
    }
    if (text.length > 60000) {
      return json({ error: "Text too large (max 60k chars)" }, 400);
    }
    if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

    const prompt = `You are converting raw LinkedIn profile export text into a structured resume JSON.
Return ONLY valid JSON matching this exact shape, no prose:
{
  "personal": {"fullName":"","title":"","email":"","phone":"","location":"","website":"","summary":""},
  "experience": [{"role":"","company":"","location":"","startDate":"","endDate":"","bullets":["",""]}],
  "education": [{"degree":"","school":"","startDate":"","endDate":"","description":""}],
  "skills": ["",""],
  "projects": [{"name":"","link":"","description":""}]
}
Rules: Keep dates as written. Bullets concise (max 5 per role). Skills max 20.

RAW TEXT:
${text}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limited, try again shortly" }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return json({ error: `AI error: ${txt.slice(0, 200)}` }, 500);
    }
    const ai = await aiRes.json();
    const content = ai.choices?.[0]?.message?.content;
    if (!content) return json({ error: "No AI response" }, 500);

    let parsed: any;
    try { parsed = JSON.parse(content); } catch {
      return json({ error: "AI returned invalid JSON" }, 500);
    }

    // Add ids to arrays
    const uid = () => Math.random().toString(36).slice(2, 9);
    parsed.experience = (parsed.experience || []).map((e: any) => ({ id: uid(), bullets: [], ...e }));
    parsed.education = (parsed.education || []).map((e: any) => ({ id: uid(), description: "", ...e }));
    parsed.projects = (parsed.projects || []).map((e: any) => ({ id: uid(), link: "", description: "", ...e }));
    parsed.skills = (parsed.skills || []).slice(0, 25);

    return json({ resume: parsed });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}