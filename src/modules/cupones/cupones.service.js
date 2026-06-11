import prisma from "../../lib/prisma.js";



export const crearCupon = async (data, creatorId) => {
  const codigo = String(data.codigo).trim().toUpperCase();
  if (!codigo) throw new Error("El código del cupón es requerido");
  if (codigo.length < 3) throw new Error("El código debe tener al menos 3 caracteres");

  const descuentoPct = Number(data.descuentoPct);
  if (isNaN(descuentoPct) || descuentoPct < 1 || descuentoPct > 100) {
    throw new Error("El descuento debe estar entre 1 y 100");
  }

  const usosMaximos = Number(data.usosMaximos ?? 100);
  if (isNaN(usosMaximos) || usosMaximos < 1) {
    throw new Error("Los usos máximos deben ser al menos 1");
  }

  const contenidoId = data.contenidoId ? Number(data.contenidoId) : null;
  const fechaExpiracion = data.fechaExpiracion ? new Date(data.fechaExpiracion) : null;

  if (contenidoId) {
    const contenido = await prisma.contenidoDigital.findUnique({
      where: { id: contenidoId },
      select: { creatorId: true },
    });
    if (!contenido) throw new Error("Contenido no encontrado");
    if (contenido.creatorId !== Number(creatorId)) {
      throw new Error("No puedes crear cupones para contenido que no te pertenece");
    }
  }

  const existente = await prisma.cupon.findUnique({ where: { codigo } });
  if (existente) throw new Error("Ya existe un cupón con ese código");

  return prisma.cupon.create({
    data: {
      codigo,
      creatorId: Number(creatorId),
      contenidoId,
      descuentoPct,
      usosMaximos,
      fechaExpiracion,
    },
  });
};

export const listarCupones = (creatorId) => {
  return prisma.cupon.findMany({
    where: { creatorId: Number(creatorId) },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { comprasInvitado: true } },
    },
  });
};

export const validarCupon = async (codigo, contenidoId) => {
  const cupon = await prisma.cupon.findUnique({
    where: { codigo: String(codigo).trim().toUpperCase() },
  });

  if (!cupon) throw new Error("Cupón no encontrado");
  if (!cupon.activo) throw new Error("Cupón inactivo");
  if (cupon.fechaExpiracion && new Date() > new Date(cupon.fechaExpiracion)) {
    throw new Error("Cupón expirado");
  }
  if (cupon.usosActuales >= cupon.usosMaximos) {
    throw new Error("Cupón agotado");
  }

  if (contenidoId) {
    const cid = Number(contenidoId);
    if (cupon.contenidoId && cupon.contenidoId !== cid) {
      throw new Error("Cupón no aplicable a este contenido");
    }
  }

  return {
    valido: true,
    descuentoPct: cupon.descuentoPct,
    codigo: cupon.codigo,
    cuponId: cupon.id,
  };
};

export const desactivarCupon = async (id, creatorId) => {
  const cupon = await prisma.cupon.findUnique({
    where: { id: Number(id) },
  });

  if (!cupon) throw new Error("Cupón no encontrado");
  if (cupon.creatorId !== Number(creatorId)) throw new Error("No autorizado");

  return prisma.cupon.update({
    where: { id: Number(id) },
    data: { activo: false },
  });
};
