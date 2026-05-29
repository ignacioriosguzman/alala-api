import { getUsuarios, getUsuario, updateUsuario, deleteUsuario } from "./usuarios.service.js";

const handleError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Usuarios] Error de Prisma:', error.message);
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
    const data = await getUsuarios();
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtener = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const data = await getUsuario(id);
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const actualizar = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const data = await updateUsuario(id, req.body);
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const eliminar = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    await deleteUsuario(id);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    handleError(error, res);
  }
};
