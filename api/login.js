export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Campos obligatorios" });
  }

  /* ---- Check against env vars ---- */
  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASS;

  if (!validUser || !validPass) {
    return res.status(500).json({ error: "Configuración del servidor incompleta" });
  }

  if (username === validUser && password === validPass) {
    /* Generate a simple session token */
    const token = Buffer.from(
      JSON.stringify({ user: username, ts: Date.now() })
    ).toString("base64");

    return res.status(200).json({ success: true, token: token, user: username });
  }

  return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
}
