import prisma from '../../lib/prisma.js';
import { crearPago, obtenerEstadoPago, validarFirmaFlow } from './flow.service.js';
import crypto from 'crypto';

const ESTADO_FLOW = { 1: 'PENDIENTE', 2: 'PAGADO', 3: 'RECHAZADO', 4: 'ANULADO' };

// POST /api/v1/pagos/crear
export const crearOrden = async (req, res) => {
  try {
    const { cursoId } = req.body;
    const userId = req.user.id;

    if (!cursoId) return res.status(400).json({ error: 'cursoId es requerido' });

    const cursoIdNum = Number(cursoId);
    if (!Number.isInteger(cursoIdNum) || cursoIdNum <= 0) {
      return res.status(400).json({ error: 'cursoId inválido' });
    }

    const curso = await prisma.course.findUnique({ where: { id: cursoIdNum } });
    if (!curso) return res.status(404).json({ error: 'Curso no encontrado' });

    const yaMatriculado = await prisma.enrollment.findFirst({
      where: { userId, courseId: curso.id },
    });
    if (yaMatriculado) return res.status(409).json({ error: 'Ya estás inscrito en este curso' });

    const usuario = await prisma.user.findUnique({ where: { id: userId } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

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

// POST /api/v1/pagos/confirmacion  ← webhook de Flow (valida firma HMAC)
export const confirmarPago = async (req, res) => {
  try {
    if (!validarFirmaFlow(req.body)) {
      console.error('[pagos] webhook: firma inválida', req.body);
      return res.status(403).send('firma inválida');
    }

    const { token } = req.body;
    if (!token) return res.status(400).send('token requerido');

    const venta = await prisma.venta.findUnique({ where: { flowToken: token } });
    if (!venta) {
      console.error('[pagos] webhook: venta no encontrada para token', token);
      return res.status(404).send('venta no encontrada');
    }

    // Idempotencia: si ya está procesado, responder 200 sin reprocessar
    if (venta.estado === 'PAGADO') {
      return res.status(200).send('');
    }

    const flowStatus = await obtenerEstadoPago(token);
    const estado = ESTADO_FLOW[flowStatus.status] ?? 'DESCONOCIDO';

    await prisma.$transaction(async (tx) => {
      await tx.venta.update({
        where: { id: venta.id },
        data: { estado, flowData: flowStatus },
      });

      if (estado === 'PAGADO') {
        const yaMatriculado = await tx.enrollment.findFirst({
          where: { userId: venta.userId, courseId: venta.courseId },
        });
        if (!yaMatriculado) {
          await tx.enrollment.create({
            data: { userId: venta.userId, courseId: venta.courseId },
          });
        }

        if (venta.instructorUserId) {
          await tx.instructorSaldo.upsert({
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
    });

    res.status(200).send('');
  } catch (err) {
    console.error('[pagos] confirmarPago:', err.message);
    res.status(500).send('error');
  }
};

// GET /api/v1/pagos/retorno?token=xxx  ← redirect de Flow al usuario
export const retornoPago = async (req, res) => {
  const { token } = req.query;
  const baseUrl = process.env.FRONTEND_URL || 'https://app.alala.cl';
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

// GET /api/v1/pagos/estado/:token
export const estadoPago = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: 'token requerido' });
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
