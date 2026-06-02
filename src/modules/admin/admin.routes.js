import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import * as ctrl from "./admin.controller.js";

const router = Router();
router.use(authGuard, roleGuard("ADMIN"));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/metricas",   ctrl.metricas);
router.get("/actividad",  ctrl.actividad);
router.get("/finanzas",   ctrl.finanzas);
router.get("/moderacion", ctrl.moderacion);
router.get("/estado",     ctrl.estado);

// ── Ventas ────────────────────────────────────────────────────────────────────
router.get("/ventas/por-mes", ctrl.ventasPorMes);

// ── Usuarios ──────────────────────────────────────────────────────────────────
router.get("/usuarios",              ctrl.listarUsuarios);
router.get("/usuarios/:id",          ctrl.detalleUsuario);
router.patch("/usuarios/:id/rol",    ctrl.cambiarRol);
router.patch("/usuarios/:id/activo", ctrl.toggleActivo);

// ── Contenidos ────────────────────────────────────────────────────────────────
router.get("/contenidos",                  ctrl.listarContenidos);
router.patch("/contenidos/:id/aprobar",    ctrl.aprobarContenido);
router.patch("/contenidos/:id/estado",     ctrl.cambiarEstado);
router.delete("/contenidos/:id",           ctrl.borrarContenido);

// ── Creadores ─────────────────────────────────────────────────────────────────
router.get("/creadores", ctrl.listarCreadores);

// ── Pagos a creadores ─────────────────────────────────────────────────────────
router.get("/pagos/pendientes",              ctrl.pagosPendientes);
router.get("/pagos/historial",               ctrl.historialPagos);
router.post("/pagos/:creatorId/registrar",   ctrl.registrarPago);

// ── Secciones ─────────────────────────────────────────────────────────────────
router.patch("/secciones", ctrl.patchSeccion);

export default router;
