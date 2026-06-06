import prisma from "../../lib/prisma.js";

export const seguir = async (req, res) => {
  const seguidorId = req.user.id;
  const seguidoId = Number(req.params.seguidoId);

  if (seguidorId === seguidoId) {
    return res.status(400).json({ error: "No puedes seguirte a ti mismo." });
  }

  try {
    const existe = await prisma.user.findUnique({ where: { id: seguidoId } });
    if (!existe) return res.status(404).json({ error: "Usuario no encontrado." });

    await prisma.userFollow.create({ data: { seguidorId, seguidoId } });
    return res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ ok: true, mensaje: "Ya sigues a este usuario." });
    console.error("[Follows] Error en seguir:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const dejarDeSeguir = async (req, res) => {
  const seguidorId = req.user.id;
  const seguidoId = Number(req.params.seguidoId);

  try {
    await prisma.userFollow.deleteMany({ where: { seguidorId, seguidoId } });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[Follows] Error en dejarDeSeguir:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const seguidores = async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    const data = await prisma.userFollow.findMany({
      where: { seguidoId: userId },
      include: { seguidor: { select: { id: true, nombre: true, creatorProfile: { select: { nombrePublico: true, avatar: true } } } } },
    });
    return res.json(data.map(f => f.seguidor));
  } catch (err) {
    return res.status(500).json({ error: "Error interno." });
  }
};

export const siguiendo = async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    const data = await prisma.userFollow.findMany({
      where: { seguidorId: userId },
      include: { seguido: { select: { id: true, nombre: true, creatorProfile: { select: { nombrePublico: true, avatar: true } } } } },
    });
    return res.json(data.map(f => f.seguido));
  } catch (err) {
    return res.status(500).json({ error: "Error interno." });
  }
};
