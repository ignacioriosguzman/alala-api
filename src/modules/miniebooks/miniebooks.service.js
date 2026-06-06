import prisma from "../../lib/prisma.js";
import { procesarManuscrito, VALID_TEMPLATES } from "./ebook.engine.js";
import { subirArchivoDrive } from "../../services/googleDrive.service.js";

const EBOOK_FIELDS = [
  "titulo", "descripcion", "descripcionLarga", "manuscritoTexto",
  "template", "categoria", "palabrasClave", "idioma",
  "precio", "precioOferta", "portadaUrl", "status",
];

const sanitize = (data) => {
  const clean = {};
  for (const key of EBOOK_FIELDS) {
    if (data[key] !== undefined) {
      if (["precio", "precioOferta"].includes(key)) {
        const n = Number(data[key]);
        if (!isNaN(n)) clean[key] = n;
      } else if (key === "palabrasClave") {
        if (Array.isArray(data[key])) clean[key] = data[key];
      } else if (key === "status") {
        const val = String(data[key]).toLowerCase();
        if (["borrador", "activo", "pausado"].includes(val)) clean[key] = val;
      } else {
        clean[key] = data[key];
      }
    }
  }
  return clean;
};

// ── CRUD básico ───────────────────────────────────────────────────

export const createEbook = async (data, autorId) => {
  const tpl = data.template;
  if (tpl && !VALID_TEMPLATES.includes(tpl)) {
    throw new Error(`Plantilla inválida. Usa: ${VALID_TEMPLATES.join(", ")}`);
  }

  return prisma.miniEbook.create({
    data: {
      ...sanitize(data),
      autorId: Number(autorId),
    },
  });
};

export const listarEbooks = async (query = {}) => {
  const { categoria, busqueda, orden, gratuito, autorId, template } = query;

  const where = { status: "activo" };

  if (categoria) where.categoria = categoria;
  if (template) where.template = template;
  if (autorId) where.autorId = Number(autorId);
  if (gratuito === "true" || gratuito === true) where.precio = 0;
  if (gratuito === "false" || gratuito === false) where.NOT = { precio: 0 };

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

  return prisma.miniEbook.findMany({
    where,
    orderBy,
    include: {
      autor: { select: { id: true, nombre: true } },
      _count: { select: { resenas: true } },
    },
  });
};

export const getEbookById = (id) => {
  return prisma.miniEbook.findUnique({
    where: { id: Number(id) },
    include: {
      autor: { select: { id: true, nombre: true, email: true } },
      _count: { select: { resenas: true, compras: true } },
    },
  });
};

export const listarMisEbooks = (autorId) => {
  return prisma.miniEbook.findMany({
    where: { autorId: Number(autorId) },
    orderBy: { createdAt: "desc" },
  });
};

export const updateEbook = async (id, data, autorId) => {
  const existing = await prisma.miniEbook.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Mini-ebook no encontrado");
  if (existing.autorId !== Number(autorId)) throw new Error("No autorizado");

  if (data.template && !VALID_TEMPLATES.includes(data.template)) {
    throw new Error(`Plantilla inválida. Usa: ${VALID_TEMPLATES.join(", ")}`);
  }

  return prisma.miniEbook.update({
    where: { id: Number(id) },
    data: sanitize(data),
  });
};

export const cambiarStatus = async (id, status, autorId) => {
  const existing = await prisma.miniEbook.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Mini-ebook no encontrado");
  if (existing.autorId !== Number(autorId)) throw new Error("No autorizado");

  const val = String(status).toLowerCase();
  if (!["borrador", "activo", "pausado"].includes(val)) {
    throw new Error("Estado inválido. Usa: borrador, activo, pausado");
  }

  return prisma.miniEbook.update({
    where: { id: Number(id) },
    data: { status: val },
  });
};

export const deleteEbook = async (id, autorId) => {
  const existing = await prisma.miniEbook.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new Error("Mini-ebook no encontrado");
  if (existing.autorId !== Number(autorId)) throw new Error("No autorizado");

  return prisma.miniEbook.delete({
    where: { id: Number(id) },
  });
};

// ── Generación de archivos ────────────────────────────────────────

export const generarArchivosEbook = async (id, autorId) => {
  const ebook = await prisma.miniEbook.findUnique({
    where: { id: Number(id) },
    include: { autor: { select: { nombre: true } } },
  });

  if (!ebook) throw new Error("Mini-ebook no encontrado");
  if (ebook.autorId !== Number(autorId)) throw new Error("No autorizado");

  const metadata = {
    titulo: ebook.titulo,
    autor: ebook.autor.nombre,
    portadaUrl: ebook.portadaUrl,
    idioma: ebook.idioma || "es",
  };

  const input = {
    texto: ebook.manuscritoTexto || "",
    template: ebook.template,
  };

  const resultado = await procesarManuscrito(input, metadata);

  // Subir EPUB y PDF a Google Drive
  const epubName = `ebook-${id}.epub`;
  const pdfName = `ebook-${id}.pdf`;

  const [epubDrive, pdfDrive] = await Promise.all([
    subirArchivoDrive(resultado.epubBuffer, epubName, "application/epub+zip"),
    subirArchivoDrive(resultado.pdfBuffer, pdfName, "application/pdf"),
  ]);

  const updated = await prisma.miniEbook.update({
    where: { id: Number(id) },
    data: {
      manuscritoHtml: resultado.html,
      epubUrl: epubDrive.downloadUrl,
      pdfUrl: pdfDrive.downloadUrl,
      indice: JSON.stringify(resultado.indice),
      palabras: resultado.palabras,
      tamanoMb: resultado.epubSizeMb + resultado.pdfSizeMb,
      paginas: Math.max(1, Math.ceil(resultado.palabras / 250)),
    },
  });

  return {
    ebook: updated,
    archivos: { epub: epubDrive, pdf: pdfDrive },
    stats: {
      palabras: resultado.palabras,
      paginas: updated.paginas,
      epubMb: resultado.epubSizeMb,
      pdfMb: resultado.pdfSizeMb,
    },
  };
};

// ── Upsell ────────────────────────────────────────────────────────

export const upsellEbooks = async (ebookId, limit = 3) => {
  const target = await prisma.miniEbook.findUnique({
    where: { id: Number(ebookId) },
    select: { autorId: true, categoria: true, template: true },
  });

  if (!target) throw new Error("Mini-ebook no encontrado");

  return prisma.miniEbook.findMany({
    where: {
      id: { not: Number(ebookId) },
      status: "activo",
      OR: [
        { autorId: target.autorId },
        { categoria: target.categoria },
        { template: target.template },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: Number(limit),
    include: {
      autor: { select: { id: true, nombre: true } },
    },
  });
};

// ── Favoritos ─────────────────────────────────────────────────────

export const toggleFavorito = async (miniEbookId, userId) => {
  const exists = await prisma.favoriteMiniEbook.findUnique({
    where: { userId_miniEbookId: { userId: Number(userId), miniEbookId: Number(miniEbookId) } },
  });
  if (exists) {
    await prisma.favoriteMiniEbook.delete({ where: { id: exists.id } });
    return { favorito: false };
  }
  await prisma.favoriteMiniEbook.create({
    data: { userId: Number(userId), miniEbookId: Number(miniEbookId) },
  });
  return { favorito: true };
};

export const listarFavoritos = (userId) => {
  return prisma.favoriteMiniEbook.findMany({
    where: { userId: Number(userId) },
    include: { miniEbook: { include: { autor: { select: { id: true, nombre: true } } } } },
    orderBy: { createdAt: "desc" },
  });
};

export const checkFavorito = async (miniEbookId, userId) => {
  const f = await prisma.favoriteMiniEbook.findUnique({
    where: { userId_miniEbookId: { userId: Number(userId), miniEbookId: Number(miniEbookId) } },
  });
  return { favorito: !!f };
};

// ── Progreso ──────────────────────────────────────────────────────

export const guardarProgreso = async (miniEbookId, data) => {
  const { userId, emailInvitado, porcentaje, leidoCompleto } = data;
  const where = userId
    ? { userId_miniEbookId: { userId: Number(userId), miniEbookId: Number(miniEbookId) } }
    : { emailInvitado_miniEbookId: { emailInvitado, miniEbookId: Number(miniEbookId) } };

  const existing = await prisma.progresoMiniEbook.findUnique({ where });

  if (existing) {
    return prisma.progresoMiniEbook.update({
      where: { id: existing.id },
      data: { porcentaje: Number(porcentaje), leidoCompleto: !!leidoCompleto },
    });
  }

  return prisma.progresoMiniEbook.create({
    data: {
      miniEbookId: Number(miniEbookId),
      userId: userId ? Number(userId) : null,
      emailInvitado: emailInvitado || null,
      porcentaje: Number(porcentaje),
      leidoCompleto: !!leidoCompleto,
    },
  });
};

export const obtenerProgreso = async (miniEbookId, userId, emailInvitado) => {
  const where = userId
    ? { userId_miniEbookId: { userId: Number(userId), miniEbookId: Number(miniEbookId) } }
    : { emailInvitado_miniEbookId: { emailInvitado, miniEbookId: Number(miniEbookId) } };

  const prog = await prisma.progresoMiniEbook.findUnique({ where });
  return prog || { porcentaje: 0, leidoCompleto: false };
};

// ── Compras ───────────────────────────────────────────────────────

export const comprarEbook = async (userId, miniEbookId) => {
  const ebook = await prisma.miniEbook.findUnique({
    where: { id: Number(miniEbookId) },
  });

  if (!ebook) throw new Error("Mini-ebook no encontrado");
  if (ebook.status !== "activo") throw new Error("Ebook no disponible");

  if ((ebook.precio ?? 0) > 0) {
    throw new Error("Este ebook requiere pago. Usa el endpoint /api/v1/pagos/ebook/crear");
  }

  const yaComprado = await prisma.compraMiniEbook.findUnique({
    where: { userId_miniEbookId: { userId: Number(userId), miniEbookId: Number(miniEbookId) } },
  });
  if (yaComprado) throw new Error("Ya has accedido a este ebook");

  return prisma.$transaction(async (tx) => {
    const compra = await tx.compraMiniEbook.create({
      data: {
        miniEbookId: Number(miniEbookId),
        userId: Number(userId),
        monto: 0,
        comisionPlataforma: 0,
        pagoCreador: 0,
        estado: "completada",
        downloadUrl: ebook.epubUrl || ebook.pdfUrl,
      },
      include: {
        miniEbook: { select: { titulo: true, portadaUrl: true } },
      },
    });
    await tx.miniEbook.update({
      where: { id: Number(miniEbookId) },
      data: { ventas: { increment: 1 } },
    });
    return compra;
  });
};

export const comprarEbookInvitado = async (email, miniEbookId) => {
  const ebook = await prisma.miniEbook.findUnique({
    where: { id: Number(miniEbookId) },
  });

  if (!ebook) throw new Error("Mini-ebook no encontrado");
  if (ebook.status !== "activo") throw new Error("Ebook no disponible");

  if ((ebook.precio ?? 0) > 0) {
    throw new Error("Este ebook requiere pago. Usa el endpoint /api/v1/pagos/ebook/crear");
  }

  const emailClean = String(email).trim().toLowerCase();

  const yaComprado = await prisma.compraMiniEbook.findUnique({
    where: { emailInvitado_miniEbookId: { emailInvitado: emailClean, miniEbookId: Number(miniEbookId) } },
  });
  if (yaComprado) throw new Error("Ya has accedido a este ebook");

  return prisma.$transaction(async (tx) => {
    const compra = await tx.compraMiniEbook.create({
      data: {
        miniEbookId: Number(miniEbookId),
        emailInvitado: emailClean,
        monto: 0,
        comisionPlataforma: 0,
        pagoCreador: 0,
        estado: "completada",
        downloadUrl: ebook.epubUrl || ebook.pdfUrl,
      },
      include: {
        miniEbook: { select: { titulo: true, portadaUrl: true } },
      },
    });
    await tx.miniEbook.update({
      where: { id: Number(miniEbookId) },
      data: { ventas: { increment: 1 } },
    });
    return compra;
  });
};

export const verificarCompra = async (userId, emailInvitado, miniEbookId) => {
  if (!userId && !emailInvitado) {
    return { comprado: false, estado: null };
  }
  const where = userId
    ? { userId_miniEbookId: { userId: Number(userId), miniEbookId: Number(miniEbookId) } }
    : { emailInvitado_miniEbookId: { emailInvitado, miniEbookId: Number(miniEbookId) } };

  const compra = await prisma.compraMiniEbook.findUnique({ where });
  return { comprado: !!compra, estado: compra?.estado || null };
};

export const misCompras = (userId) => {
  return prisma.compraMiniEbook.findMany({
    where: { userId: Number(userId), estado: "completada" },
    orderBy: { createdAt: "desc" },
    include: {
      miniEbook: {
        select: { id: true, titulo: true, portadaUrl: true, categoria: true, template: true },
      },
    },
  });
};

// ── Estadísticas del autor ────────────────────────────────────────

export const estadisticasAutor = async (autorId) => {
  const ebooks = await prisma.miniEbook.findMany({
    where: { autorId: Number(autorId) },
    select: { id: true, titulo: true },
  });

  const ebookIds = ebooks.map((e) => e.id);

  const compras = await prisma.compraMiniEbook.findMany({
    where: {
      miniEbookId: { in: ebookIds },
      estado: "completada",
    },
    orderBy: { createdAt: "desc" },
    include: {
      miniEbook: { select: { titulo: true } },
    },
  });

  const favoritos = await prisma.favoriteMiniEbook.count({
    where: { miniEbookId: { in: ebookIds } },
  });

  const totalVentas = compras.length;
  const totalMonto = compras.reduce((acc, c) => acc + c.monto, 0);
  const totalComision = compras.reduce((acc, c) => acc + c.comisionPlataforma, 0);
  const totalPagoCreador = compras.reduce((acc, c) => acc + c.pagoCreador, 0);

  const porEbook = {};
  for (const c of compras) {
    const tid = c.miniEbookId;
    if (!porEbook[tid]) {
      porEbook[tid] = {
        ebookId: tid,
        titulo: c.miniEbook.titulo,
        ventas: 0,
        monto: 0,
      };
    }
    porEbook[tid].ventas += 1;
    porEbook[tid].monto += c.monto;
  }

  const porMes = {};
  for (const c of compras) {
    const mes = c.createdAt.toISOString().slice(0, 7);
    if (!porMes[mes]) {
      porMes[mes] = { mes, ventas: 0, monto: 0, comision: 0, pagoCreador: 0 };
    }
    porMes[mes].ventas += 1;
    porMes[mes].monto += c.monto;
    porMes[mes].comision += c.comisionPlataforma;
    porMes[mes].pagoCreador += c.pagoCreador;
  }

  return {
    resumen: {
      totalEbooks: ebooks.length,
      totalVentas,
      totalMonto,
      totalComisionPlataforma: totalComision,
      totalPagoCreador,
      totalFavoritos: favoritos,
    },
    porEbook: Object.values(porEbook),
    porMes: Object.values(porMes).sort((a, b) => b.mes.localeCompare(a.mes)),
    comprasRecientes: compras.slice(0, 20),
  };
};

// ── Reseñas ───────────────────────────────────────────────────────

export const crearResena = async (miniEbookId, userId, rating, comentario) => {
  const ebook = await prisma.miniEbook.findUnique({
    where: { id: Number(miniEbookId) },
  });
  if (!ebook) throw new Error("Mini-ebook no encontrado");

  const yaReseno = await prisma.resenaMiniEbook.findFirst({
    where: { miniEbookId: Number(miniEbookId), userId: Number(userId) },
  });
  if (yaReseno) throw new Error("Ya has reseñado este ebook");

  const resena = await prisma.resenaMiniEbook.create({
    data: {
      miniEbookId: Number(miniEbookId),
      userId: Number(userId),
      rating: Number(rating),
      comentario: String(comentario),
    },
  });

  // Recalcular rating promedio
  const todas = await prisma.resenaMiniEbook.findMany({
    where: { miniEbookId: Number(miniEbookId) },
    select: { rating: true },
  });
  const promedio = todas.reduce((a, b) => a + b.rating, 0) / todas.length;

  await prisma.miniEbook.update({
    where: { id: Number(miniEbookId) },
    data: { rating: parseFloat(promedio.toFixed(1)), reviews: todas.length },
  });

  return resena;
};

export const listarResenas = (miniEbookId) => {
  return prisma.resenaMiniEbook.findMany({
    where: { miniEbookId: Number(miniEbookId) },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, nombre: true } } },
  });
};
