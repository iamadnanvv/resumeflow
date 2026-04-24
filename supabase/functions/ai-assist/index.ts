const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { mode, payload } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    let system = "You write concise, ATS-friendly resume content. No fluff, no markdown.";
    let user = "";

    if (mode === "summary") {
      user = `Write a 2-3 sentence professional summary for this person. Return ONLY the summary text.\n\nPerson: ${JSON.stringify(payload.personal)}\nExperience: ${JSON.stringify(payload.experience)?.slice(0, 1500)}`;
    } else if (mode === "bullets") {
      user = `Rewrite/generate 3-5 strong achievement bullets for the role "${payload.role}" at "${payload.company}". Each bullet must start with a strong action verb, include a metric where possible, and be one line. Return ONLY the bullets, one per line, no numbering or dashes.\n\nExisting bullets: ${JSON.stringify(payload.existing)}`;
    } else if (mode === "cover_letter") {
      user = `Write a tailored, professional cover letter (3-4 short paragraphs) for the role "${payload.jobTitle}" at "${payload.company}". Use the candidate's resume below for context. Friendly but professional tone. Return ONLY the letter text, no markdown, no salutation placeholders — sign as the candidate's name.\n\nResume: ${JSON.stringify(payload.resumeContent)?.slice(0, 3000)}`;
    } else {
      throw new Error("Unknown mode");
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) throw new Error(`AI gateway: ${r.status}`);

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});