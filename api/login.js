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

  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;

  if (!validUser || !validPass) {
    return res.status(500).json({ error: "Configuración del servidor incompleta" });
  }

  if (username === validUser && password === validPass) {
    const token = Buffer.from(
      JSON.stringify({ user: username, ts: Date.now() })
    ).toString("base64");

    /* Log session to Supabase (non-blocking) */
    const supabase = getSupabase();
    if (supabase) {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        "unknown";
      const ua = req.headers["user-agent"] || "unknown";
      const tokenHash = Buffer.from(token.slice(-16)).toString("hex");

      supabase.from("admin_sessions").insert({
        username,
        ip_address: ip,
        user_agent: ua,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        is_active: true,
      }).then(() => {}).catch(() => {});
    }

    return res.status(200).json({ success: true, token, user: username });
  }

  return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
}
