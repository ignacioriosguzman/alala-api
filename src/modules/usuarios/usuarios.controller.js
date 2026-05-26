import { getUsuarios, getUsuario, updateUsuario, deleteUsuario } from "./usuarios.service.js";

export const listar = async (req, res, next) => {
  try {
    const usuarios = await getUsuarios();
    res.json({ status: "ok", data: usuarios });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const usuario = await getUsuario(req.params.id);
    if (!usuario) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    res.json({ status: "ok", data: usuario });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const usuario = await updateUsuario(req.params.id, req.body);
    res.json({ status: "ok", message: "Usuario actualizado", data: usuario });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await deleteUsuario(req.params.id);
    res.json({ status: "ok", message: "Usuario eliminado" });
  } catch (error) {
    next(error);
  }
};
