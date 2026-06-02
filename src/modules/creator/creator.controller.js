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
    const data = await upsertProfile(req.user.id, { nombrePublico, bio, avatar, especialidad, sitioWeb, instagram, twitter });
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
