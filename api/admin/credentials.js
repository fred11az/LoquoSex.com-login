// TODO: add authentication when ready
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return res.status(500).json({ error: "Configuración del servidor incompleta" });
  }

  return res.status(200).json({ user, pass });
}
