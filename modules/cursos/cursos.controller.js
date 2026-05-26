import { getCursos, getCurso, createCurso, updateCurso, deleteCurso } from "./cursos.service.js";

export const listar = async (req, res, next) => {
  try {
    const cursos = await getCursos();
    res.json({ status: "ok", data: cursos });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const curso = await getCurso(req.params.id);
    if (!curso) return res.status(404).json({ status: "error", message: "Curso no encontrado" });
    res.json({ status: "ok", data: curso });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const curso = await createCurso(req.body);
    res.status(201).json({ status: "ok", message: "Curso creado", data: curso });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const curso = await updateCurso(req.params.id, req.body);
    res.json({ status: "ok", message: "Curso actualizado", data: curso });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await deleteCurso(req.params.id);
    res.json({ status: "ok", message: "Curso eliminado" });
  } catch (error) {
    next(error);
  }
};
