import prisma from "../../lib/prisma.js";

export const guardar = async (req, res) => {
  const userId = req.user.id;
  const { articuloId } = req.params;
  if (!articuloId || typeof articuloId !== "string") {
    return res.status(400).json({ error: "articuloId inválido." });
  }
  try {
    await prisma.articleFavorite.create({ data: { userId, articuloId } });
    return res.status(201).json({ ok: true, guardado: true });
  } catch (err) {
    if (err.code === "P2002") return res.json({ ok: true, guardado: true });
    console.error("[ArticleFavorites] Error en guardar:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const quitar = async (req, res) => {
  const userId = req.user.id;
  const { articuloId } = req.params;
  try {
    await prisma.articleFavorite.deleteMany({ where: { userId, articuloId } });
    return res.json({ ok: true, guardado: false });
  } catch (err) {
    console.error("[ArticleFavorites] Error en quitar:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const estado = async (req, res) => {
  const userId = req.user.id;
  const { articuloId } = req.params;
  try {
    const fav = await prisma.articleFavorite.findUnique({
      where: { userId_articuloId: { userId, articuloId } },
    });
    return res.json({ guardado: !!fav });
  } catch (err) {
    console.error("[ArticleFavorites] Error en estado:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};

export const listarMios = async (req, res) => {
  const userId = req.user.id;
  try {
    const favs = await prisma.articleFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { articuloId: true, createdAt: true },
    });
    return res.json(favs.map(f => f.articuloId));
  } catch (err) {
    console.error("[ArticleFavorites] Error en listar:", err.message);
    return res.status(500).json({ error: "Error interno." });
  }
};
