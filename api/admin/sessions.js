import { createClient } from "@supabase/supabase-js";

// TODO: add authentication when ready
function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: "Base de datos no configurada" });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("admin_sessions")
      .select("id, username, ip_address, user_agent, created_at, expires_at, is_active")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ sessions: data });
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "ID obligatorio" });

    const { error } = await supabase
      .from("admin_sessions")
      .update({ is_active: false })
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
