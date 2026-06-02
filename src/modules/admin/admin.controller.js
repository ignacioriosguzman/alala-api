import prisma from "../../lib/prisma.js";
import * as svc from "./admin.service.js";

const ok   = (res, data) => res.json(data);
const fail = (res, e, code = 500) => {
  console.error("[Admin]", e.message ?? e);
  res.status(code).json({ error: e.message ?? "Error interno" });
};

// ── Endpoints existentes ──────────────────────────────────────────────────────

export const metricas   = (req, res, next) => svc.getMetricas().then(d => ok(res, d)).catch(next);
export const actividad  = (req, res, next) => svc.getActividad().then(d => ok(res, d)).catch(next);
export const finanzas   = (req, res, next) => svc.getFinanzas().then(d => ok(res, d)).catch(next);
export const moderacion = (req, res, next) => svc.getModeracion().then(d => ok(res, d)).catch(next);
export const estado     = (req, res, next) => svc.getEstado().then(d => ok(res, d)).catch(next);

export const patchSeccion = (req, res, next) => {
  try {
    const { seccion, activo } = req.body;
    if (!seccion || activo === undefined) return res.status(400).json({ error: "Faltan campos: seccion, activo" });
    res.json({ ok: true, seccionesEstado: svc.toggleSeccion(seccion, activo) });
  } catch (e) {
    e.message?.startsWith("Sección") ? res.status(400).json({ error: e.message }) : next(e);
  }
};

// Bug fix: antes usaba dynamic import incorrecto
export const aprobarContenido = async (req, res, next) => {
  try {
    const updated = await prisma.contenidoDigital.update({
      where: { id: Number(req.params.id) },
      data: { status: "activo" },
      select: { id: true, titulo: true, status: true },
    });
    ok(res, updated);
  } catch (e) { next(e); }
};

// ── Ventas por mes ────────────────────────────────────────────────────────────

export const ventasPorMes = (req, res, next) =>
  svc.getVentasPorMes().then(d => ok(res, d)).catch(next);

// ── Usuarios ──────────────────────────────────────────────────────────────────

export const listarUsuarios = async (req, res, next) => {
  try { ok(res, await svc.getUsuarios(req.query)); } catch (e) { next(e); }
};

export const detalleUsuario = async (req, res, next) => {
  try {
    const data = await svc.getUsuarioDetalle(req.params.id);
    if (!data) return res.status(404).json({ error: "Usuario no encontrado" });
    ok(res, data);
  } catch (e) { next(e); }
};

export const cambiarRol = async (req, res, next) => {
  try {
    const { role } = req.body;
    const rolesValidos = ["STUDENT","INSTRUCTOR","CREATOR","ADMIN"];
    if (!rolesValidos.includes(role)) return res.status(400).json({ error: "Rol inválido" });
    ok(res, await svc.cambiarRolUsuario(req.params.id, role));
  } catch (e) { next(e); }
};

export const toggleActivo = async (req, res, next) => {
  try {
    const { activo } = req.body;
    if (activo === undefined) return res.status(400).json({ error: "Campo activo requerido" });
    ok(res, await svc.toggleActivoUsuario(req.params.id, activo));
  } catch (e) { next(e); }
};

// ── Contenidos ────────────────────────────────────────────────────────────────

export const listarContenidos = async (req, res, next) => {
  try { ok(res, await svc.getContenidos(req.query)); } catch (e) { next(e); }
};

export const cambiarEstado = async (req, res, next) => {
  try {
    const { status } = req.body;
    const statusValidos = ["borrador","activo","pausado"];
    if (!statusValidos.includes(status)) return res.status(400).json({ error: "Status inválido" });
    ok(res, await svc.cambiarEstadoContenido(req.params.id, status));
  } catch (e) { next(e); }
};

export const borrarContenido = async (req, res, next) => {
  try {
    await svc.eliminarContenido(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
};

// ── Creadores ─────────────────────────────────────────────────────────────────

export const listarCreadores = (req, res, next) =>
  svc.getCreadores().then(d => ok(res, d)).catch(next);

// ── Pagos ─────────────────────────────────────────────────────────────────────

export const pagosPendientes = (req, res, next) =>
  svc.getPagosPendientes().then(d => ok(res, d)).catch(next);

export const historialPagos  = (req, res, next) =>
  svc.getHistorialPagos().then(d => ok(res, d)).catch(next);

export const registrarPago = async (req, res, next) => {
  try {
    const { monto, descripcion, referencia } = req.body;
    if (!monto) return res.status(400).json({ error: "monto es obligatorio" });
    ok(res, await svc.marcarPagado(req.params.creatorId, { monto, descripcion, referencia, adminId: req.user.id }));
  } catch (e) {
    e.message === "Creador no encontrado" || e.message === "Monto inválido"
      ? res.status(400).json({ error: e.message })
      : next(e);
  }
};
