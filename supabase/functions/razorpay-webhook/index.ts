import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

async function hmacSha256Hex(key: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (!SECRET) return new Response("Webhook not configured", { status: 400 });
    const sig = req.headers.get("x-razorpay-signature");
    const body = await req.text();
    const expected = await hmacSha256Hex(SECRET, body);
    if (sig !== expected) return new Response("Invalid signature", { status: 400 });

    const evt = JSON.parse(body);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (evt.event === "payment.captured") {
      const p = evt.payload.payment.entity;
      await admin.from("payments").update({ status: "paid", razorpay_payment_id: p.id }).eq("razorpay_order_id", p.order_id);
    } else if (evt.event === "payment.failed") {
      const p = evt.payload.payment.entity;
      await admin.from("payments").update({ status: "failed" }).eq("razorpay_order_id", p.order_id);
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Error", { status: 500 });
  }
});