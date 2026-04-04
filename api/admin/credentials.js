function validateToken(req) {
  const auth = req.headers["authorization"] || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    if (Date.now() - decoded.ts > 30 * 60 * 1000) return null;
    if (decoded.user !== process.env.ADMIN_USER) return null;
    return decoded;
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = validateToken(req);
  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  return res.status(200).json({
    user: process.env.ADMIN_USER,
    pass: process.env.ADMIN_PASS,
  });
}
