import { PrismaClient } from '@prisma/client';
import { crearPago, obtenerEstadoPago } from './flow.service.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ESTADO_FLOW = { 1: 'PENDIENTE', 2: 'PAGADO', 3: 'RECHAZADO', 4: 'ANULADO' };

// POST /api/v1/pagos/crear
// Body: { cursoId }
// Header: Authorization: Bearer <token>
export const crearOrden = async (req, res) => {
  try {
    const { cursoId } = req.body;
    const userId = req.user.id;

    if (!cursoId) return res.status(400).json({ error: 'cursoId es requerido' });

    const curso = await prisma.course.findUnique({ where: { id: Number(cursoId) } });
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });

    // Evitar compra duplicada
    const yaMatriculado = await prisma.enrollment.findFirst({
      where: { userId, courseId: curso.id },
    });
    if (yaMatriculado) return res.status(409).json({ error: 'Ya estás inscrito en este curso' });

    const usuario = await prisma.user.findUnique({ where: { id: userId } });

    const commerceOrder = `ALALA-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;

    const flowData = await crearPago({
      commerceOrder,
      amount: curso.precio,
      email: usuario.email,
      subject: `Curso: ${curso.titulo}`,
    });

    await prisma.venta.create({
      data: {
        flowToken: flowData.token,
        flowOrder: commerceOrder,
        userId,
        courseId: curso.id,
        instructorUserId: curso.instructorUserId ?? null,
        monto: curso.precio,
        comisionPlataforma: Math.round(curso.precio * 0.12),
        pagoInstructor: Math.round(curso.precio * 0.88),
        estado: 'PENDIENTE',
        flowData,
      },
    });

    res.json({
      urlPago: `${flowData.url}?token=${flowData.token}`,
      token: flowData.token,
      commerceOrder,
    });
  } catch (err) {
    console.error('[pagos] crearOrden:', err.message);
    res.status(500).json({ error: 'Error al crear la orden de pago' });
  }
};

// POST /api/v1/pagos/confirmacion  ← webhook de Flow (sin autenticación)
export const confirmarPago = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).send('token requerido');

    const flowStatus = await obtenerEstadoPago(token);
    const estado = ESTADO_FLOW[flowStatus.status] ?? 'DESCONOCIDO';

    const venta = await prisma.venta.findUnique({ where: { flowToken: token } });
    if (!venta) {
      console.error('[pagos] webhook: venta no encontrada para token', token);
      return res.status(404).send('venta no encontrada');
    }

    await prisma.venta.update({
      where: { id: venta.id },
      data: { estado, flowData: flowStatus },
    });

    if (estado === 'PAGADO') {
      const yaMatriculado = await prisma.enrollment.findFirst({
        where: { userId: venta.userId, courseId: venta.courseId },
      });
      if (!yaMatriculado) {
        await prisma.enrollment.create({
          data: { userId: venta.userId, courseId: venta.courseId },
        });
      }

      if (venta.instructorUserId) {
        await prisma.instructorSaldo.upsert({
          where: { userId: venta.instructorUserId },
          create: {
            userId: venta.instructorUserId,
            saldoPendiente: venta.pagoInstructor,
            saldoAcumulado: venta.pagoInstructor,
          },
          update: {
            saldoPendiente: { increment: venta.pagoInstructor },
            saldoAcumulado: { increment: venta.pagoInstructor },
          },
        });
      }
    }

    // Flow espera una respuesta 200 vacía
    res.status(200).send('');
  } catch (err) {
    console.error('[pagos] confirmarPago:', err.message);
    res.status(500).send('error');
  }
};

// GET /api/v1/pagos/retorno?token=xxx  ← redirect de Flow al usuario
export const retornoPago = async (req, res) => {
  const { token } = req.query;
  const baseUrl = process.env.FRONTEND_URL;
  try {
    if (!token) return res.redirect(`${baseUrl}/pago-fallido.html?error=sin_token`);

    const venta = await prisma.venta.findUnique({ where: { flowToken: token } });
    if (!venta) return res.redirect(`${baseUrl}/pago-fallido.html?error=no_encontrada`);

    if (venta.estado === 'PAGADO') {
      return res.redirect(`${baseUrl}/pago-exitoso.html?orden=${venta.flowOrder}&curso=${venta.courseId}`);
    }
    return res.redirect(`${baseUrl}/pago-fallido.html?estado=${venta.estado}&orden=${venta.flowOrder}`);
  } catch (err) {
    console.error('[pagos] retornoPago:', err.message);
    res.redirect(`${baseUrl}/pago-fallido.html?error=servidor`);
  }
};

// GET /api/v1/pagos/estado/:token  ← consulta de estado desde el frontend
export const estadoPago = async (req, res) => {
  try {
    const { token } = req.params;
    const venta = await prisma.venta.findUnique({
      where: { flowToken: token },
      select: { estado: true, flowOrder: true, monto: true, courseId: true },
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando estado' });
  }
};
