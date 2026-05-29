import prisma from "../../lib/prisma.js";



const MICRO_FIELDS = [
  "titulo", "descripcion", "contenido", "tipo", "precio",
  "publicado", "portadaUrl", "categoria", "palabrasClave",
  "paginas", "lecturaMin",
];

const TIPOS_VALIDOS = ["microtexto", "manual", "instructivo", "minicurso"];

const sanitize = (data) => {
  const clean = {};
  for (const key of MICRO_FIELDS) {
    if (data[key] !== undefined) {
      if (["precio", "paginas", "lecturaMin"].includes(key)) {
        const n = Number(data[key]);
        if (!isNaN(n)) clean[key] = n;
      } else if (key === "publicado") {
        clean[key] = data[key] === true || data[key] === "true" || data[key] === 1;
      } else if (key === "palabrasClave") {
        if (Array.isArray(data[key])) clean[key] = data[key];
      } else {
        clean[key] = data[key];
      }
    }
  }
  return clean;
};

export const createMicro = (data, autorId) => {
  if (data.tipo && !TIPOS_VALIDOS.includes(data.tipo)) {
    throw new Error("Tipo inválido. Usa: microtexto, manual, instructivo, minicurso");
  }
  return prisma.microContenido.create({
    data: { ...sanitize(data), autorId: Number(autorId) },
  });
};

export const listarMicros = async (query = {}) => {
  const { tipo, categoria, busqueda, orden, gratuito, autorId } = query;

  const where = { publicado: true };

  if (tipo) where.tipo = tipo;
  if (categoria) where.categoria = categoria;
  if (autorId) where.autorId = Number(autorId);
  if (gratuito === "true" || gratuito === true) where.precio = null;
  if (gratuito === "false" || gratuito === false) where.NOT = { precio: null };

  if (busqueda) {
    where.OR = [
      { titulo: { contains: busqueda, mode: "insensitive" } },
      { descripcion: { contains: busqueda, mode: "insensitive" } },
      { palabrasClave: { has: busqueda } },
    ];
  }

  let orderBy = { creadoEn: "desc" };
  if (orden === "popularidad") orderBy = { creadoEn: "desc" };
  else if (orden === "precio") orderBy = { precio: "asc" };
  else if (orden === "nuevo") orderBy = { creadoEn: "desc" };

  return prisma.microContenido.findMany({
    where,
    orderBy,
    include: {
      autor: { select: { id: true, nombre: true } },
      _count: { select: { resenas: true } },
    },
  });
};

export const listarPorTipo = (tipo) => {
  if (!TIPOS_VALIDOS.includes(tipo)) throw new Error("Tipo inválido");
  return prisma.microContenido.findMany({
    where: { tipo, publicado: true },
    orderBy: { creadoEn: "desc" },
    include: {
      autor: { select: { id: true, nombre: true } },
      _count: { select: { resenas: true } },
    },
  });
};

export const getMicroById = (id) => {
  return prisma.microContenido.findUnique({
    where: { id: Number(id) },
    include: {
      autor: { select: { id: true, nombre: true, email: true } },
      _count: { select: { resenas: true, compras: true } },
    },
  });
};

export const listarMisMicros = (autorId) => {
  return prisma.microContenido.findMany({
    where: { autorId: Number(autorId) },
    orderBy: { creadoEn: "desc" },
  });
};

export const updateMicro = async (id, data, autorId) => {
  const existing = await prisma.microContenido.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("MicroContenido no encontrado");
  if (existing.autorId !== Number(autorId)) throw new Error("No autorizado");

  if (data.tipo && !TIPOS_VALIDOS.includes(data.tipo)) {
    throw new Error("Tipo inválido. Usa: microtexto, manual, instructivo, minicurso");
  }

  return prisma.microContenido.update({
    where: { id: Number(id) },
    data: sanitize(data),
  });
};

export const togglePublicado = async (id, publicado, autorId) => {
  const existing = await prisma.microContenido.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("MicroContenido no encontrado");
  if (existing.autorId !== Number(autorId)) throw new Error("No autorizado");

  return prisma.microContenido.update({
    where: { id: Number(id) },
    data: { publicado: publicado === true || publicado === "true" },
  });
};

export const deleteMicro = async (id, autorId) => {
  const existing = await prisma.microContenido.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("MicroContenido no encontrado");
  if (existing.autorId !== Number(autorId)) throw new Error("No autorizado");

  return prisma.microContenido.delete({
    where: { id: Number(id) },
  });
};

export const upsellMicros = async (microId, limit = 3) => {
  const target = await prisma.microContenido.findUnique({
    where: { id: Number(microId) },
    select: { autorId: true, tipo: true, categoria: true },
  });

  if (!target) throw new Error("MicroContenido no encontrado");

  return prisma.microContenido.findMany({
    where: {
      id: { not: Number(microId) },
      publicado: true,
      OR: [
        { autorId: target.autorId },
        { tipo: target.tipo },
        { categoria: target.categoria },
      ],
    },
    orderBy: { creadoEn: "desc" },
    take: Number(limit),
    include: {
      autor: { select: { id: true, nombre: true } },
    },
  });
};

// ── Favoritos ──
export const toggleFavoritoMicro = async (microContenidoId, userId) => {
  const exists = await prisma.favoriteMicroContenido.findUnique({
    where: { userId_microContenidoId: { userId: Number(userId), microContenidoId: Number(microContenidoId) } },
  });
  if (exists) {
    await prisma.favoriteMicroContenido.delete({ where: { id: exists.id } });
    return { favorito: false };
  }
  await prisma.favoriteMicroContenido.create({
    data: { userId: Number(userId), microContenidoId: Number(microContenidoId) },
  });
  return { favorito: true };
};

export const listarFavoritosMicro = (userId) => {
  return prisma.favoriteMicroContenido.findMany({
    where: { userId: Number(userId) },
    include: { microContenido: { include: { autor: { select: { id: true, nombre: true } } } } },
    orderBy: { createdAt: "desc" },
  });
};

export const checkFavoritoMicro = async (microContenidoId, userId) => {
  const f = await prisma.favoriteMicroContenido.findUnique({
    where: { userId_microContenidoId: { userId: Number(userId), microContenidoId: Number(microContenidoId) } },
  });
  return { favorito: !!f };
};

// ── Progreso de lectura ──
export const guardarProgresoMicro = async (microContenidoId, data) => {
  const { userId, emailInvitado, porcentaje, leidoCompleto } = data;
  const where = userId
    ? { userId_microContenidoId: { userId: Number(userId), microContenidoId: Number(microContenidoId) } }
    : { emailInvitado_microContenidoId: { emailInvitado, microContenidoId: Number(microContenidoId) } };

  const existing = await prisma.progresoMicroContenido.findUnique({ where });

  if (existing) {
    return prisma.progresoMicroContenido.update({
      where: { id: existing.id },
      data: { porcentaje: Number(porcentaje), leidoCompleto: !!leidoCompleto },
    });
  }

  return prisma.progresoMicroContenido.create({
    data: {
      microContenidoId: Number(microContenidoId),
      userId: userId ? Number(userId) : null,
      emailInvitado: emailInvitado || null,
      porcentaje: Number(porcentaje),
      leidoCompleto: !!leidoCompleto,
    },
  });
};

export const obtenerProgresoMicro = async (microContenidoId, userId, emailInvitado) => {
  const where = userId
    ? { userId_microContenidoId: { userId: Number(userId), microContenidoId: Number(microContenidoId) } }
    : { emailInvitado_microContenidoId: { emailInvitado, microContenidoId: Number(microContenidoId) } };

  const prog = await prisma.progresoMicroContenido.findUnique({ where });
  return prog || { porcentaje: 0, leidoCompleto: false };
};

// ── Compras ──
export const comprarMicro = async (userId, microContenidoId) => {
  const micro = await prisma.microContenido.findUnique({
    where: { id: Number(microContenidoId) },
  });

  if (!micro) throw new Error("MicroContenido no encontrado");
  if (!micro.publicado) throw new Error("Contenido no disponible");

  const yaComprado = await prisma.compraMicroContenido.findUnique({
    where: {
      userId_microContenidoId: {
        userId: Number(userId),
        microContenidoId: Number(microContenidoId),
      },
    },
  });

  if (yaComprado) throw new Error("Ya has comprado este contenido");

  const monto = micro.precio ?? 0;
  const comisionPlataforma = Math.round(monto * ((micro.comisionPct ?? 20) / 100));
  const pagoCreador = monto - comisionPlataforma;

  return prisma.$transaction(async (tx) => {
    const compra = await tx.compraMicroContenido.create({
      data: {
        microContenidoId: Number(microContenidoId),
        userId: Number(userId),
        monto,
        comisionPlataforma,
        pagoCreador,
        estado: "completada",
      },
      include: {
        microContenido: { select: { titulo: true, portadaUrl: true, contenido: true } },
      },
    });

    return compra;
  });
};

export const comprarMicroInvitado = async (email, microContenidoId) => {
  const micro = await prisma.microContenido.findUnique({
    where: { id: Number(microContenidoId) },
  });

  if (!micro) throw new Error("MicroContenido no encontrado");
  if (!micro.publicado) throw new Error("Contenido no disponible");

  const emailClean = String(email).trim().toLowerCase();

  const yaComprado = await prisma.compraMicroContenido.findUnique({
    where: {
      emailInvitado_microContenidoId: {
        emailInvitado: emailClean,
        microContenidoId: Number(microContenidoId),
      },
    },
  });

  if (yaComprado) throw new Error("Ya has comprado este contenido");

  const monto = micro.precio ?? 0;
  const comisionPlataforma = Math.round(monto * ((micro.comisionPct ?? 20) / 100));
  const pagoCreador = monto - comisionPlataforma;

  return prisma.$transaction(async (tx) => {
    const compra = await tx.compraMicroContenido.create({
      data: {
        microContenidoId: Number(microContenidoId),
        emailInvitado: emailClean,
        monto,
        comisionPlataforma,
        pagoCreador,
        estado: "completada",
      },
      include: {
        microContenido: { select: { titulo: true, portadaUrl: true, contenido: true } },
      },
    });

    return compra;
  });
};

export const verificarCompraMicro = async (userId, emailInvitado, microContenidoId) => {
  if (!userId && !emailInvitado) {
    return { comprado: false, estado: null };
  }
  const where = userId
    ? { userId_microContenidoId: { userId: Number(userId), microContenidoId: Number(microContenidoId) } }
    : { emailInvitado_microContenidoId: { emailInvitado, microContenidoId: Number(microContenidoId) } };

  const compra = await prisma.compraMicroContenido.findUnique({ where });
  return { comprado: !!compra, estado: compra?.estado || null };
};

export const misComprasMicro = (userId) => {
  return prisma.compraMicroContenido.findMany({
    where: { userId: Number(userId), estado: "completada" },
    orderBy: { createdAt: "desc" },
    include: {
      microContenido: {
        select: { id: true, titulo: true, tipo: true, portadaUrl: true, categoria: true },
      },
    },
  });
};

export const confirmarCompraMicro = async (microContenidoId, userId) => {
  const compra = await prisma.compraMicroContenido.findUnique({
    where: {
      userId_microContenidoId: {
        userId: Number(userId),
        microContenidoId: Number(microContenidoId),
      },
    },
  });

  if (!compra) throw new Error("Compra no encontrada");
  if (compra.estado !== "pendiente") throw new Error("La compra ya está confirmada o cancelada");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.compraMicroContenido.update({
      where: { id: compra.id },
      data: { estado: "completada" },
    });

    await tx.microContenido.update({
      where: { id: Number(microContenidoId) },
      data: { /* no hay ventas counter en MicroContenido, se puede agregar luego */ },
    });

    return updated;
  });
};
