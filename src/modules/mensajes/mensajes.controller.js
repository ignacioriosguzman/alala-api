import { PrismaClient } from "@prisma/client";
import { createMensaje, getMensajesByCurso, countNoLeidos } from "./mensajes.service.js";

const prisma = new PrismaClient();

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Mensajes] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const enviar = async (req, res) => {
  try {
    const { cursoId, destinatarioId, texto } = req.body;
    if (!cursoId || !destinatarioId || !texto) {
      return res.status(400).json({ error: "cursoId, destinatarioId y texto son requeridos" });
    }
    const mensaje = await createMensaje({
      cursoId,
      destinatarioId,
      texto,
      remitenteId: req.user.id,
    });
    res.status(201).json(mensaje);
  } catch (error) {
    handleError(error, res);
  }
};

export const listarPorCurso = async (req, res) => {
  try {
    const cursoId = Number(req.params.cursoId);
    const userId = req.user.id;

    const curso = await prisma.course.findUnique({
      where: { id: cursoId },
      select: { instructorUserId: true },
    });
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });

    const isInstructor = curso.instructorUserId === userId;
    const isEnrolled = await prisma.enrollment.findFirst({
      where: { userId, courseId: cursoId },
    });

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ error: "No tienes acceso a los mensajes de este curso" });
    }

    const mensajes = await getMensajesByCurso(cursoId);
    res.json(mensajes);
  } catch (error) {
    handleError(error, res);
  }
};

export const noLeidos = async (req, res) => {
  try {
    const count = await countNoLeidos(req.user.id);
    res.json({ noLeidos: count });
  } catch (error) {
    handleError(error, res);
  }
};
