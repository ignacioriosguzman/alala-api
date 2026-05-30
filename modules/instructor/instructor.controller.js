import {
  getVentasInstructor,
  getSaldoInstructor,
  getCursosInstructor,
} from "./instructor.service.js";

const parseId = (req, res) => {
  const id = Number(req.params.id ?? req.user?.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return null;
  }
  // Un instructor solo puede ver sus propios datos (a menos que sea ADMIN)
  if (req.user.role !== "ADMIN" && req.user.id !== id) {
    res.status(403).json({ error: "Acceso denegado" });
    return null;
  }
  return id;
};

export const ventas = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  try {
    res.json(await getVentasInstructor(id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saldo = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  try {
    res.json(await getSaldoInstructor(id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cursos = async (req, res) => {
  const id = parseId(req, res);
  if (!id) return;
  try {
    res.json(await getCursosInstructor(id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
