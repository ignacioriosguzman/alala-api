import { getCursos, getCurso, createCurso, updateCurso, deleteCurso, upsellRecomendaciones } from "./cursos.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Cursos] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

const validarId = (id) => {
  const n = Number(id);
  return isNaN(n) ? null : n;
};

export const listar = async (req, res) => {
  try {
    const data = await getCursos();
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtener = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const data = await getCurso(id);
    if (!data) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const crear = async (req, res) => {
  try {
    const data = await createCurso(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const actualizar = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const data = await updateCurso(id, req.body);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const eliminar = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    await deleteCurso(id);
    res.json({ message: 'Curso eliminado' });
  } catch (error) {
    handleError(error, res);
  }
};

export const upsell = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const data = await upsellRecomendaciones(id, req.query.limit);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};
