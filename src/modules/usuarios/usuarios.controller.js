import { getUsuarios, getUsuario, updateUsuario, deleteUsuario } from "./usuarios.service.js";

export const listar = async (req, res) => res.json(await getUsuarios());
export const obtener = async (req, res) => res.json(await getUsuario(req.params.id));
export const actualizar = async (req, res) =>
  res.json(await updateUsuario(req.params.id, req.body));
export const eliminar = async (req, res) =>
  res.json(await deleteUsuario(req.params.id));
