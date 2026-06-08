import {
  getSaldoDisponible,
  solicitarRetiro,
  getHistorialRetiros,
  listarSolicitudesPendientes,
  procesarSolicitud,
} from "./retiros.service.js";

export const saldo = async (req, res) => {
  try {
    const data = await getSaldoDisponible(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("[retiros] saldo:", err.message);
    res.status(500).json({ error: "Error interno" });
  }
};

export const solicitar = async (req, res) => {
  try {
    const solicitud = await solicitarRetiro(req.user.id, req.body);
    res.status(201).json({
      message: "Solicitud de retiro registrada. Te avisaremos cuando sea procesada.",
      solicitud,
    });
  } catch (err) {
    console.error("[retiros] solicitar:", err.message);
    res.status(err.status ?? 400).json({ error: err.message });
  }
};

export const historial = async (req, res) => {
  try {
    const data = await getHistorialRetiros(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("[retiros] historial:", err.message);
    res.status(500).json({ error: "Error interno" });
  }
};

// ── Admin ──────────────────────────────────────────────────────────

export const pendientes = async (req, res) => {
  try {
    const data = await listarSolicitudesPendientes();
    res.json(data);
  } catch (err) {
    console.error("[retiros] pendientes:", err.message);
    res.status(500).json({ error: "Error interno" });
  }
};

export const procesar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }
    const data = await procesarSolicitud(id, req.user.id, req.body);
    res.json({ message: "Solicitud actualizada", solicitud: data });
  } catch (err) {
    console.error("[retiros] procesar:", err.message);
    res.status(err.status ?? 500).json({ error: err.message });
  }
};
