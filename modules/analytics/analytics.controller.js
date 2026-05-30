import prisma from "../../lib/prisma.js";

import { registrarEvento, getDashboardCurso, getResumenInstructor } from "./analytics.service.js";



const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Analytics] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const evento = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.user?.id && !data.userId) {
      data.userId = req.user.id;
    }
    const result = await registrarEvento(data);
    res.status(201).json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const dashboardCurso = async (req, res) => {
  try {
    const cursoId = Number(req.params.cursoId);
    const curso = await prisma.course.findUnique({
      where: { id: cursoId },
      select: { instructorUserId: true },
    });
    if (!curso) return res.status(404).json({ error: "Curso no encontrado" });

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = curso.instructorUserId === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const result = await getDashboardCurso(cursoId);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};

export const resumenInstructor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    if (req.user.role !== "ADMIN" && req.user.id !== id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const result = await getResumenInstructor(id);
    res.json(result);
  } catch (error) {
    handleError(error, res);
  }
};
