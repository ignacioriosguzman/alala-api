import prisma from "../../lib/prisma.js";



const CONTENIDO_FIELDS = [
  "titulo", "descripcion", "descripcionLarga", "tipo", "categoria",
  "subcategoria", "precio", "precioOferta", "portadaUrl", "pdfUrl",
  "previewUrls", "paginas", "tamanoMb", "idioma", "nivel",
  "status", "comisionPct", "indice", "palabrasClave",
];

const sanitize = (data) => {
  const clean = {};
  for (const key of CONTENIDO_FIELDS) {
    if (data[key] !== undefined) {
      if (["precio", "precioOferta", "paginas"].includes(key)) {
        const n = Number(data[key]);
        if (!isNaN(n)) clean[key] = n;
      } else if (["tamanoMb", "comisionPct"].includes(key)) {
        const val = parseFloat(data[key]);
        if (!isNaN(val)) clean[key] = val;
      } else if (key === "previewUrls" || key === "palabrasClave") {
        if (Array.isArray(data[key])) clean[key] = data[key];
      } else {
        clean[key] = data[key];
      }
    }
  }
  return clean;
};

export const createContenido = (data, creatorId) => {
  return prisma.contenidoDigital.create({
    data: { ...sanitize(data), creatorId: Number(creatorId) },
  });
};

export const listarCatalogo = async (query) => {
  const { tipo, categoria, precioMin, precioMax, busqueda, orden, creadorId } = query;

  const where = { status: "activo" };

  if (tipo) where.tipo = tipo;
  if (categoria) where.categoria = categoria;
  if (creadorId) where.creatorId = Number(creadorId);

  if (precioMin !== undefined || precioMax !== undefined) {
    where.precio = {};
    if (precioMin !== undefined) where.precio.gte = Number(precioMin);
    if (precioMax !== undefined) where.precio.lte = Number(precioMax);
  }

  if (busqueda) {
    where.OR = [
      { titulo: { contains: busqueda, mode: "insensitive" } },
      { descripcion: { contains: busqueda, mode: "insensitive" } },
      { palabrasClave: { has: busqueda } },
    ];
  }

  let orderBy = { createdAt: "desc" };
  if (orden === "popularidad") orderBy = { ventas: "desc" };
  else if (orden === "precio") orderBy = { precio: "asc" };
  else if (orden === "nuevo") orderBy = { createdAt: "desc" };

  return prisma.contenidoDigital.findMany({
    where,
    orderBy,
    select: {
      id: true, titulo: true, descripcion: true, tipo: true, categoria: true,
      subcategoria: true, precio: true, precioOferta: true, portadaUrl: true,
      paginas: true, tamanoMb: true, idioma: true, nivel: true, status: true,
      ventas: true, rating: true, reviews: true, palabrasClave: true,
      createdAt: true, creatorId: true,
      creator: { select: { id: true, nombre: true } },
    },
  });
};

export const getContenidoById = (id) => {
  return prisma.contenidoDigital.findUnique({
    where: { id: Number(id) },
    include: {
      creator: { select: { id: true, nombre: true } },
    },
  });
};

export const listarMisContenidos = (creatorId) => {
  return prisma.contenidoDigital.findMany({
    where: { creatorId: Number(creatorId) },
    orderBy: { createdAt: "desc" },
  });
};

export const updateContenido = async (id, data, creatorId) => {
  const existing = await prisma.contenidoDigital.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Contenido no encontrado");
  if (existing.creatorId !== Number(creatorId)) throw new Error("No autorizado");

  return prisma.contenidoDigital.update({
    where: { id: Number(id) },
    data: sanitize(data),
  });
};

export const cambiarStatus = async (id, status, creatorId) => {
  const existing = await prisma.contenidoDigital.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Contenido no encontrado");
  if (existing.creatorId !== Number(creatorId)) throw new Error("No autorizado");

  return prisma.contenidoDigital.update({
    where: { id: Number(id) },
    data: { status },
  });
};

export const deleteContenido = async (id, creatorId) => {
  const existing = await prisma.contenidoDigital.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Contenido no encontrado");
  if (existing.creatorId !== Number(creatorId)) throw new Error("No autorizado");

  return prisma.contenidoDigital.delete({
    where: { id: Number(id) },
  });
};

export const upsellRecomendaciones = async (contenidoId, limit = 3) => {
  const target = await prisma.contenidoDigital.findUnique({
    where: { id: Number(contenidoId) },
    select: { creatorId: true, categoria: true },
  });

  if (!target) throw new Error("Contenido no encontrado");

  return prisma.contenidoDigital.findMany({
    where: {
      id: { not: Number(contenidoId) },
      status: "activo",
      OR: [
        { creatorId: target.creatorId },
        { categoria: target.categoria },
      ],
    },
    orderBy: { ventas: "desc" },
    take: Number(limit),
    include: {
      creator: { select: { id: true, nombre: true } },
    },
  });
};
