import prisma from "../../lib/prisma.js";

const MONTO_MINIMO = 5000;

export const getSaldoDisponible = async (userId) => {
  const saldo = await prisma.instructorSaldo.findUnique({ where: { userId } });
  return {
    saldoPendiente: saldo?.saldoPendiente ?? 0,
    saldoAcumulado: saldo?.saldoAcumulado ?? 0,
    saldoPagado: saldo?.saldoPagado ?? 0,
  };
};

export const solicitarRetiro = async (userId, { monto, metodo, cuenta }) => {
  const montoInt = Math.round(Number(monto));
  if (!montoInt || montoInt < MONTO_MINIMO) {
    throw Object.assign(new Error(`El monto mínimo de retiro es ${MONTO_MINIMO} CLP`), { status: 400 });
  }
  if (!metodo || typeof metodo !== 'string' || metodo.trim().length === 0) {
    throw Object.assign(new Error('El método de pago es requerido'), { status: 400 });
  }
  if (!cuenta || typeof cuenta !== 'string' || cuenta.trim().length < 5) {
    throw Object.assign(new Error('Los datos de cuenta son requeridos'), { status: 400 });
  }

  const saldo = await prisma.instructorSaldo.findUnique({ where: { userId } });
  const disponible = saldo?.saldoPendiente ?? 0;
  if (montoInt > disponible) {
    throw Object.assign(
      new Error(`Saldo insuficiente. Tienes ${disponible} CLP disponibles`),
      { status: 400 }
    );
  }

  const pendientes = await prisma.solicitudRetiro.count({
    where: { userId, estado: 'pendiente' },
  });
  if (pendientes >= 3) {
    throw Object.assign(
      new Error('Tienes solicitudes de retiro pendientes. Espera a que sean procesadas antes de crear una nueva.'),
      { status: 409 }
    );
  }

  const solicitud = await prisma.solicitudRetiro.create({
    data: {
      userId,
      monto: montoInt,
      metodo: metodo.trim(),
      cuenta: cuenta.trim(),
      estado: 'pendiente',
    },
  });

  return solicitud;
};

export const getHistorialRetiros = async (userId) => {
  return prisma.solicitudRetiro.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      monto: true,
      estado: true,
      metodo: true,
      cuenta: true,
      respuesta: true,
      procesadoEn: true,
      createdAt: true,
    },
  });
};

// Admin: listar todas las solicitudes pendientes
export const listarSolicitudesPendientes = async () => {
  return prisma.solicitudRetiro.findMany({
    where: { estado: 'pendiente' },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { nombre: true, email: true } },
    },
  });
};

// Admin: procesar o rechazar solicitud
export const procesarSolicitud = async (id, adminId, { estado, respuesta }) => {
  if (!['procesado', 'rechazado'].includes(estado)) {
    throw Object.assign(new Error('Estado inválido. Usa: procesado | rechazado'), { status: 400 });
  }

  const solicitud = await prisma.solicitudRetiro.findUnique({ where: { id } });
  if (!solicitud) throw Object.assign(new Error('Solicitud no encontrada'), { status: 404 });
  if (solicitud.estado !== 'pendiente') {
    throw Object.assign(new Error('La solicitud ya fue procesada'), { status: 409 });
  }

  // Transacción interactiva: re-verifica estado y saldo dentro del mismo bloque atómico
  // para prevenir condición de carrera en procesamiento concurrente de retiros.
  return prisma.$transaction(async (tx) => {
    const sol = await tx.solicitudRetiro.findUnique({ where: { id } });
    if (!sol || sol.estado !== 'pendiente') {
      throw Object.assign(new Error('La solicitud ya fue procesada'), { status: 409 });
    }

    if (estado === 'procesado') {
      const saldo = await tx.instructorSaldo.findUnique({ where: { userId: sol.userId } });
      const disponible = saldo?.saldoPendiente ?? 0;
      if (disponible < sol.monto) {
        console.error(`[retiros] Saldo insuficiente al procesar id=${id}. Disponible=${disponible}, Requerido=${sol.monto}, userId=${sol.userId}`);
        throw Object.assign(
          new Error(`Saldo insuficiente al procesar. Disponible: ${disponible} CLP, requerido: ${sol.monto} CLP`),
          { status: 400 }
        );
      }
      await tx.instructorSaldo.update({
        where: { userId: sol.userId },
        data: {
          saldoPendiente: { decrement: sol.monto },
          saldoPagado:    { increment: sol.monto },
        },
      });
    }

    return tx.solicitudRetiro.update({
      where: { id },
      data: {
        estado,
        respuesta:   respuesta?.trim() || null,
        procesadoEn: new Date(),
        adminId,
      },
    });
  });
};
