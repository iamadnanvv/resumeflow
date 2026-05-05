const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You regenerate ONE section of a resume from a free-form description.
Return ONLY the requested section via the provided tool. Be specific, quantified, ATS-friendly.
- summary: 2-3 punchy sentences tailored to the target role.
- skills: 8-15 industry-standard, ATS-friendly keywords.
- experience: 1-4 roles, each with 3-5 strong action-verb bullets with metrics where possible.
Use plausible companies/dates if vague; never invent contact info.`;

const TOOL = {
  type: "function",
  function: {
    name: "emit_section",
    description: "Emit one resume section.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string" },
              company: { type: "string" },
              location: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
            required: ["role", "company", "bullets"],
          },
        },
      },
      additionalProperties: false,
    },
  },
};

const rid = () => Math.random().toString(36).slice(2, 10);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { description, section } = await req.json();
    if (!["summary", "skills", "experience"].includes(section)) {
      return new Response(JSON.stringify({ error: "Invalid section" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Please describe what you want in at least 10 characters." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Regenerate ONLY the "${section}" section from this description:\n\n${description}` },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "emit_section" } },
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again in a minute." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      console.error("AI gateway error:", r.status, t);
      throw new Error(`AI gateway: ${r.status}`);
    }

    const data = await r.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) throw new Error("AI returned no structured output");
    const parsed = JSON.parse(call.function.arguments);

    let out: any = {};
    if (section === "summary") out.summary = parsed.summary ?? "";
    if (section === "skills") out.skills = Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [];
    if (section === "experience") {
      out.experience = (parsed.experience ?? []).map((e: any) => ({
        id: rid(),
        role: e.role ?? "",
        company: e.company ?? "",
        location: e.location ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
        bullets: Array.isArray(e.bullets) ? e.bullets.filter(Boolean) : [],
      }));
    }

    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});