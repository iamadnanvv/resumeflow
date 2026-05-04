const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You generate complete, ATS-optimized resumes from a free-form description.
Return ONLY a JSON object via the provided tool. Be specific, quantified, and realistic.
- Write 3-5 strong action-verb bullets per role with metrics where possible.
- Skills should be 8-15 industry-standard, ATS-friendly keywords.
- Summary: 2-3 punchy sentences tailored to target role.
- Use plausible companies/dates if user is vague; never invent contact info — leave email/phone empty unless given.`;

const RESUME_TOOL = {
  type: "function",
  function: {
    name: "emit_resume",
    description: "Emit a complete resume JSON object.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short resume title, e.g. 'Senior PM Resume'" },
        personal: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            title: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
            website: { type: "string" },
            summary: { type: "string" },
          },
          required: ["fullName", "title", "summary"],
        },
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
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              degree: { type: "string" },
              school: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              description: { type: "string" },
            },
            required: ["degree", "school"],
          },
        },
        skills: { type: "array", items: { type: "string" } },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              link: { type: "string" },
              description: { type: "string" },
            },
            required: ["name", "description"],
          },
        },
        certifications: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              issuer: { type: "string" },
              date: { type: "string" },
              link: { type: "string" },
            },
            required: ["name", "issuer"],
          },
        },
        languages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              proficiency: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
      required: ["title", "personal", "experience", "education", "skills"],
      additionalProperties: false,
    },
  },
};

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { description } = await req.json();
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
          { role: "user", content: `Generate a complete resume from this description:\n\n${description}` },
        ],
        tools: [RESUME_TOOL],
        tool_choice: { type: "function", function: { name: "emit_resume" } },
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

    // Normalize to ResumeContent shape with stable IDs
    const content = {
      personal: {
        fullName: parsed.personal?.fullName ?? "",
        title: parsed.personal?.title ?? "",
        email: parsed.personal?.email ?? "",
        phone: parsed.personal?.phone ?? "",
        location: parsed.personal?.location ?? "",
        website: parsed.personal?.website ?? "",
        summary: parsed.personal?.summary ?? "",
      },
      experience: (parsed.experience ?? []).map((e: any) => ({
        id: rid(),
        role: e.role ?? "",
        company: e.company ?? "",
        location: e.location ?? "",
        startDate: e.startDate ?? "",
        endDate: e.endDate ?? "",
        bullets: Array.isArray(e.bullets) ? e.bullets.filter(Boolean) : [],
      })),
      education: (parsed.education ?? []).map((ed: any) => ({
        id: rid(),
        degree: ed.degree ?? "",
        school: ed.school ?? "",
        startDate: ed.startDate ?? "",
        endDate: ed.endDate ?? "",
        description: ed.description ?? "",
      })),
      skills: Array.isArray(parsed.skills) ? parsed.skills.filter(Boolean) : [],
      projects: (parsed.projects ?? []).map((p: any) => ({
        id: rid(),
        name: p.name ?? "",
        link: p.link ?? "",
        description: p.description ?? "",
      })),
      certifications: (parsed.certifications ?? []).map((c: any) => ({
        id: rid(),
        name: c.name ?? "",
        issuer: c.issuer ?? "",
        date: c.date ?? "",
        link: c.link ?? "",
      })),
      languages: (parsed.languages ?? []).map((l: any) => ({
        id: rid(),
        name: l.name ?? "",
        proficiency: l.proficiency ?? "",
      })),
    };

    return new Response(JSON.stringify({ title: parsed.title || "AI Generated Resume", content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});