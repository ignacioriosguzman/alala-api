import { getCursos, getCurso, createCurso, updateCurso, deleteCurso } from "./cursos.service.js";

export const listar = async (req, res) => res.json(await getCursos());
export const obtener = async (req, res) => res.json(await getCurso(req.params.id));
export const crear = async (req, res) => res.json(await createCurso(req.body));
export const actualizar = async (req, res) =>
  res.json(await updateCurso(req.params.id, req.body));
export const eliminar = async (req, res) =>
  res.json(await deleteCurso(req.params.id));
