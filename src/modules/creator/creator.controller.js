import { sanitizeText } from "../../utils/sanitize.js";
import {
  getProfile, upsertProfile,
  getLink, registrarVisita, getStats,
  getEarningsMonthly, getConversion,
} from "./creator.service.js";

const ok = (res, data) => res.json(data);
const fail = (res, err, msg = "Error interno") => {
  console.error("[Creator]", err);
  res.status(500).json({ error: msg });
};

// GET /creator/profile
export const perfil = async (req, res) => {
  try {
    const data = await getProfile(req.user.id);
    ok(res, data ?? {});
  } catch (e) { fail(res, e); }
};

// POST /creator/profile  —  crea o actualiza (upsert)
export const crearPerfil = async (req, res) => {
  try {
    const { nombrePublico, bio, avatar, especialidad, sitioWeb, instagram, twitter } = req.body;
    if (!nombrePublico?.trim()) return res.status(400).json({ error: "nombrePublico es obligatorio" });
    // Validar longitudes máximas para prevenir abuso
    if (nombrePublico.length > 120) return res.status(400).json({ error: "nombrePublico máximo 120 caracteres" });
    if (bio?.length > 2000) return res.status(400).json({ error: "bio máximo 2000 caracteres" });
    if (avatar?.length > 500) return res.status(400).json({ error: "avatar URL máximo 500 caracteres" });
    if (especialidad?.length > 100) return res.status(400).json({ error: "especialidad máximo 100 caracteres" });
    if (sitioWeb?.length > 500) return res.status(400).json({ error: "sitioWeb máximo 500 caracteres" });
    if (instagram?.length > 100) return res.status(400).json({ error: "instagram máximo 100 caracteres" });
    if (twitter?.length > 100) return res.status(400).json({ error: "twitter máximo 100 caracteres" });
    const data = await upsertProfile(req.user.id, {
      nombrePublico: sanitizeText(nombrePublico),
      bio: sanitizeText(bio),
      avatar,
      especialidad: sanitizeText(especialidad),
      sitioWeb,
      instagram: sanitizeText(instagram),
      twitter: sanitizeText(twitter),
    });
    ok(res, data);
  } catch (e) { fail(res, e); }
};

// PUT /creator/profile  —  alias del POST (upsert)
export const editarPerfil = crearPerfil;

// GET /creator/link
export const link = (req, res) => ok(res, getLink(req.user.id));

// POST /creator/link/visit  —  público, registra visita por ?ref=
export const visita = async (req, res) => {
  try {
    const { creatorId } = req.body;
    if (!creatorId) return res.status(400).json({ error: "creatorId requerido" });
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] ?? req.socket.remoteAddress;
    const ua = req.headers["user-agent"];
    await registrarVisita(creatorId, ip, ua);
    res.json({ ok: true });
  } catch (e) { fail(res, e); }
};

// GET /creator/stats
export const stats = async (req, res) => {
  try { ok(res, await getStats(req.user.id)); }
  catch (e) { fail(res, e); }
};

// GET /creator/earnings/monthly
export const earningsMonthly = async (req, res) => {
  try { ok(res, await getEarningsMonthly(req.user.id)); }
  catch (e) { fail(res, e); }
};

// GET /creator/conversion
export const conversion = async (req, res) => {
  try { ok(res, await getConversion(req.user.id)); }
  catch (e) { fail(res, e); }
};
