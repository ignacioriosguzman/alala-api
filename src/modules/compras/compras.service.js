import prisma from "../../lib/prisma.js";

import { validarCupon } from "../cupones/cupones.service.js";


export const comprarContenido = async (userId, contenidoId) => {
  const contenido = await prisma.contenidoDigital.findUnique({
    where: { id: Number(contenidoId) },
  });

  if (!contenido) throw new Error("Contenido no encontrado");
  if (contenido.status !== "activo") throw new Error("Contenido no disponible");

  const monto = contenido.precioOferta ?? contenido.precio;
  if (monto > 0) throw new Error("Este contenido tiene un costo. Usa el flujo de pago.");

  const yaComprado = await prisma.compraContenido.findUnique({
    where: {
      userId_contenidoId: {
        userId: Number(userId),
        contenidoId: Number(contenidoId),
      },
    },
  });

  if (yaComprado) throw new Error("Ya has comprado este contenido");

  const comisionPlataforma = Math.round(monto * (contenido.comisionPct / 100));
  const pagoCreador = monto - comisionPlataforma;

  return prisma.$transaction(async (tx) => {
    const compra = await tx.compraContenido.create({
      data: {
        contenidoId: Number(contenidoId),
        userId: Number(userId),
        monto,
        comisionPlataforma,
        pagoCreador,
        estado: "completada",
        downloadUrl: contenido.pdfUrl,
      },
      include: {
        contenido: { select: { titulo: true, portadaUrl: true } },
      },
    });

    await tx.contenidoDigital.update({
      where: { id: Number(contenidoId) },
      data: { ventas: { increment: 1 } },
    });

    return compra;
  });
};

export const listarMisDescargas = (userId) => {
  return prisma.compraContenido.findMany({
    where: { userId: Number(userId), estado: "completada" },
    orderBy: { createdAt: "desc" },
    include: {
      contenido: {
        select: {
          id: true,
          titulo: true,
          tipo: true,
          portadaUrl: true,
          categoria: true,
        },
      },
    },
  });
};

export const obtenerDownloadUrl = async (userId, contenidoId) => {
  const compra = await prisma.compraContenido.findUnique({
    where: {
      userId_contenidoId: {
        userId: Number(userId),
        contenidoId: Number(contenidoId),
      },
    },
  });

  if (!compra) throw new Error("No has comprado este contenido");
  if (compra.estado !== "completada") throw new Error("Compra no completada");

  return { downloadUrl: compra.downloadUrl };
};

export const reporteCreador = async (creatorId) => {
  const contenidos = await prisma.contenidoDigital.findMany({
    where: { creatorId: Number(creatorId) },
    select: { id: true },
  });

  const contenidoIds = contenidos.map((c) => c.id);

  const ventas = await prisma.compraContenido.findMany({
    where: {
      contenidoId: { in: contenidoIds },
      estado: "completada",
    },
    orderBy: { createdAt: "desc" },
    include: {
      contenido: { select: { titulo: true, tipo: true } },
      user: { select: { nombre: true, email: true } },
    },
  });

  const totalVentas = ventas.length;
  const totalMonto = ventas.reduce((acc, v) => acc + v.monto, 0);
  const totalComision = ventas.reduce((acc, v) => acc + v.comisionPlataforma, 0);
  const totalPagoCreador = ventas.reduce((acc, v) => acc + v.pagoCreador, 0);

  const porMes = {};
  for (const venta of ventas) {
    const mes = venta.createdAt.toISOString().slice(0, 7);
    if (!porMes[mes]) {
      porMes[mes] = { mes, ventas: 0, monto: 0, comision: 0, pagoCreador: 0 };
    }
    porMes[mes].ventas += 1;
    porMes[mes].monto += venta.monto;
    porMes[mes].comision += venta.comisionPlataforma;
    porMes[mes].pagoCreador += venta.pagoCreador;
  }

  return {
    ventas,
    resumen: {
      totalVentas,
      totalMonto,
      totalComisionPlataforma: totalComision,
      totalPagoCreador,
    },
    porMes: Object.values(porMes).sort((a, b) => b.mes.localeCompare(a.mes)),
  };
};

export const comprarContenidoInvitado = async (email, nombre, contenidoId, cuponCodigo) => {
  const contenido = await prisma.contenidoDigital.findUnique({
    where: { id: Number(contenidoId) },
  });

  if (!contenido) throw new Error("Contenido no encontrado");
  if (contenido.status !== "activo") throw new Error("Contenido no disponible");

  let monto = contenido.precioOferta ?? contenido.precio;
  if (monto > 0 && !cuponCodigo) throw new Error("Este contenido tiene un costo. Usa el flujo de pago.");

  let cuponId = null;

  if (cuponCodigo) {
    const validacion = await validarCupon(cuponCodigo, contenidoId);
    // Validar que el cupón pertenezca al creador del contenido
    const cuponRecord = await prisma.cupon.findUnique({
      where: { id: validacion.cuponId },
      select: { creatorId: true, contenidoId: true },
    });
    if (!cuponRecord) throw new Error("Cupón no encontrado");
    if (cuponRecord.creatorId !== contenido.creatorId) {
      throw new Error("Cupón no válido para este contenido");
    }
    cuponId = validacion.cuponId;
    monto = Math.round(monto * (1 - validacion.descuentoPct / 100));
  }

  const comisionPlataforma = Math.round(monto * (contenido.comisionPct / 100));
  const pagoCreador = monto - comisionPlataforma;

  return prisma.$transaction(async (tx) => {
    const compra = await tx.compraInvitado.create({
      data: {
        email: String(email).trim().toLowerCase(),
        nombre: nombre ? String(nombre).trim() : null,
        contenidoId: Number(contenidoId),
        monto,
        comisionPlataforma,
        pagoCreador,
        cuponId,
        estado: "completada",
        downloadUrl: contenido.pdfUrl,
      },
      include: {
        contenido: { select: { titulo: true, portadaUrl: true } },
        cupon: { select: { codigo: true, descuentoPct: true } },
      },
    });

    await tx.contenidoDigital.update({
      where: { id: Number(contenidoId) },
      data: { ventas: { increment: 1 } },
    });

    if (cuponId) {
      await tx.cupon.update({
        where: { id: cuponId },
        data: { usosActuales: { increment: 1 } },
      });
    }

    return { compra, downloadUrl: contenido.pdfUrl };
  });
};

export const comprarBundle = async (userId, contenidoIds) => {
  if (!Array.isArray(contenidoIds) || contenidoIds.length !== 3) {
    throw new Error("Debes seleccionar exactamente 3 contenidos");
  }

  const ids = contenidoIds.map(Number);
  const contenidos = await prisma.contenidoDigital.findMany({
    where: { id: { in: ids } },
  });

  if (contenidos.length !== 3) throw new Error("Uno o más contenidos no encontrados");
  if (contenidos.some((c) => c.status !== "activo")) {
    throw new Error("Uno o más contenidos no están disponibles");
  }

  for (const cid of ids) {
    const yaComprado = await prisma.compraContenido.findUnique({
      where: { userId_contenidoId: { userId: Number(userId), contenidoId: cid } },
    });
    if (yaComprado) throw new Error("Ya has comprado uno de estos contenidos");
  }

  const sorted = [...contenidos].sort((a, b) => {
    const pa = a.precioOferta ?? a.precio;
    const pb = b.precioOferta ?? b.precio;
    return pa - pb;
  });

  return prisma.$transaction(async (tx) => {
    const compras = [];
    for (let i = 0; i < sorted.length; i++) {
      const c = sorted[i];
      const base = c.precioOferta ?? c.precio;
      const monto = i === 0 ? 0 : base;
      const comisionPlataforma = Math.round(monto * (c.comisionPct / 100));
      const pagoCreador = monto - comisionPlataforma;

      const compra = await tx.compraContenido.create({
        data: {
          contenidoId: c.id,
          userId: Number(userId),
          monto,
          comisionPlataforma,
          pagoCreador,
          estado: "completada",
          downloadUrl: c.pdfUrl,
        },
        include: {
          contenido: { select: { titulo: true, portadaUrl: true } },
        },
      });

      await tx.contenidoDigital.update({
        where: { id: c.id },
        data: { ventas: { increment: 1 } },
      });

      compras.push(compra);
    }
    return compras;
  });
};

export const comprarBundleInvitado = async (email, nombre, contenidoIds) => {
  if (!Array.isArray(contenidoIds) || contenidoIds.length !== 3) {
    throw new Error("Debes seleccionar exactamente 3 contenidos");
  }

  const ids = contenidoIds.map(Number);
  const contenidos = await prisma.contenidoDigital.findMany({
    where: { id: { in: ids } },
  });

  if (contenidos.length !== 3) throw new Error("Uno o más contenidos no encontrados");
  if (contenidos.some((c) => c.status !== "activo")) {
    throw new Error("Uno o más contenidos no están disponibles");
  }

  const sorted = [...contenidos].sort((a, b) => {
    const pa = a.precioOferta ?? a.precio;
    const pb = b.precioOferta ?? b.precio;
    return pa - pb;
  });

  return prisma.$transaction(async (tx) => {
    const compras = [];
    for (let i = 0; i < sorted.length; i++) {
      const c = sorted[i];
      const base = c.precioOferta ?? c.precio;
      const monto = i === 0 ? 0 : base;
      const comisionPlataforma = Math.round(monto * (c.comisionPct / 100));
      const pagoCreador = monto - comisionPlataforma;

      const compra = await tx.compraInvitado.create({
        data: {
          email: String(email).trim().toLowerCase(),
          nombre: nombre ? String(nombre).trim() : null,
          contenidoId: c.id,
          monto,
          comisionPlataforma,
          pagoCreador,
          estado: "completada",
          downloadUrl: c.pdfUrl,
        },
        include: {
          contenido: { select: { titulo: true, portadaUrl: true } },
        },
      });

      await tx.contenidoDigital.update({
        where: { id: c.id },
        data: { ventas: { increment: 1 } },
      });

      compras.push(compra);
    }
    return compras;
  });
};

export const guardarProgreso = async (userId, emailInvitado, contenidoId, paginaActual, totalPaginas) => {
  const contenido = await prisma.contenidoDigital.findUnique({
    where: { id: Number(contenidoId) },
    select: { paginas: true },
  });

  if (!contenido) throw new Error("Contenido no encontrado");

  const pagina = Number(paginaActual);
  if (isNaN(pagina) || pagina < 1) throw new Error("Página inválida");

  const total = totalPaginas ? Number(totalPaginas) : contenido.paginas;
  const porcentaje = total && total > 0 ? Math.min(100, Math.round((pagina / total) * 100)) : 0;

  const whereClause = userId
    ? { userId_contenidoId: { userId: Number(userId), contenidoId: Number(contenidoId) } }
    : { emailInvitado_contenidoId: { emailInvitado: String(emailInvitado).trim().toLowerCase(), contenidoId: Number(contenidoId) } };

  return prisma.progresoLectura.upsert({
    where: whereClause,
    update: { paginaActual: pagina, porcentaje },
    create: {
      userId: userId ? Number(userId) : null,
      emailInvitado: userId ? null : String(emailInvitado).trim().toLowerCase(),
      contenidoId: Number(contenidoId),
      paginaActual: pagina,
      porcentaje,
    },
  });
};

export const obtenerProgreso = async (userId, emailInvitado, contenidoId) => {
  const where = userId
    ? { userId: Number(userId), contenidoId: Number(contenidoId) }
    : { emailInvitado: String(emailInvitado).trim().toLowerCase(), contenidoId: Number(contenidoId) };

  return prisma.progresoLectura.findFirst({ where });
};

export const listarFavoritosContenido = (userId) => {
  return prisma.favoriteContenido.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
    include: {
      contenido: {
        select: {
          id: true,
          titulo: true,
          tipo: true,
          portadaUrl: true,
          categoria: true,
          precio: true,
          precioOferta: true,
          status: true,
        },
      },
    },
  });
};

export const toggleFavoritoContenido = async (userId, contenidoId) => {
  const existente = await prisma.favoriteContenido.findUnique({
    where: {
      userId_contenidoId: {
        userId: Number(userId),
        contenidoId: Number(contenidoId),
      },
    },
  });

  if (existente) {
    await prisma.favoriteContenido.delete({ where: { id: existente.id } });
    return { favorito: false };
  }

  await prisma.favoriteContenido.create({
    data: {
      userId: Number(userId),
      contenidoId: Number(contenidoId),
    },
  });

  return { favorito: true };
};

export const checkFavoritoContenido = async (userId, contenidoId) => {
  const existente = await prisma.favoriteContenido.findUnique({
    where: {
      userId_contenidoId: {
        userId: Number(userId),
        contenidoId: Number(contenidoId),
      },
    },
  });
  return { favorito: !!existente };
};
