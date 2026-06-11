import { getUsuarios, getUsuario, getUsuarioPublico, updateUsuario, deleteUsuario } from "./usuarios.service.js";

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

export const obtenerPublico = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const data = await getUsuarioPublico(id);
    if (!data) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(data);
  } catch (error) {
    handleError(error, res);
  }
};

export const obtener = async (req, res) => {
  try {
    const id = validarId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
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
    const isAdmin = req.user.role === 'ADMIN';
    if (!isAdmin && req.user.id !== id) {
      return res.status(403).json({ error: 'Solo puedes modificar tu propio perfil' });
    }
    // Validar que no se intente modificar el password por este endpoint
    if (req.body.password !== undefined) {
      return res.status(400).json({ error: 'No puedes cambiar la contraseña por este endpoint. Usa /auth/reset-password' });
    }
    const data = await updateUsuario(id, req.body, isAdmin);
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
