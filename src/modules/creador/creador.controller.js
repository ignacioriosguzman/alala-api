import { getResumen, getMicrocursos, getManuales, getVentas } from "./creador.service.js";

export const resumen = async (req, res) => {
  try {
    const data = await getResumen(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("[Creador] resumen error:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

export const microcursos = async (req, res) => {
  try {
    const data = await getMicrocursos(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("[Creador] microcursos error:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

export const manuales = async (req, res) => {
  try {
    const data = await getManuales(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("[Creador] manuales error:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

export const ventas = async (req, res) => {
  try {
    const data = await getVentas(req.params.id);
    res.json(data);
  } catch (err) {
    console.error("[Creador] ventas error:", err);
    res.status(500).json({ error: "Error interno" });
  }
};
