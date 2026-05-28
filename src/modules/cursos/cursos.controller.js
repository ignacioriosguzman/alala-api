import { getCursos, getCurso, createCurso, updateCurso, deleteCurso, upsellRecomendaciones } from "./cursos.service.js";

export const listar = async (req, res) => res.json(await getCursos());
export const obtener = async (req, res) => res.json(await getCurso(req.params.id));
export const crear = async (req, res) => res.json(await createCurso(req.body));
export const actualizar = async (req, res) =>
  res.json(await updateCurso(req.params.id, req.body));
export const eliminar = async (req, res) =>
  res.json(await deleteCurso(req.params.id));
export const upsell = async (req, res) => {
  try {
    const data = await upsellRecomendaciones(req.params.id, req.query.limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
