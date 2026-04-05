import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: "Base de datos no configurada" });
  }

  const { data, error } = await supabase
    .from("admin_sessions")
    .select("id, username, password, ip_address, user_agent, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ sessions: data });
}
