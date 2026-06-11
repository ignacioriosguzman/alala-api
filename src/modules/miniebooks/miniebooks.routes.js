import express from "express";
import rateLimit from "express-rate-limit";
import { authGuard, optionalAuth } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { validate } from "../../middlewares/validate.js";
import { miniebookSchema, miniebookStatusSchema, progresoSchema, compraInvitadoSchema, resenaSchema } from "../../validators/schemas.js";
import {
  crear,
  listar,
  obtener,
  misEbooks,
  editar,
  cambiarEstado,
  eliminar,
  generar,
  upsell,
  toggleFav,
  misFavoritos,
  checkFav,
  saveProgreso,
  getProgreso,
  comprar,
  comprarInvitado,
  checkCompra,
  getMisCompras,
  estadisticas,
  crearResenaCtrl,
  listarResenasCtrl,
} from "./miniebooks.controller.js";

const router = express.Router();

const invitadoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta más tarde." },
});

// Rutas específicas ANTES de las dinámicas /:id para evitar shadowing
router.get("/mis-ebooks", authGuard, misEbooks);
router.get("/mis-compras", authGuard, getMisCompras);
router.get("/favoritos/mis-favoritos", authGuard, misFavoritos);
router.get("/estadisticas/mis-stats", authGuard, estadisticas);

// Públicos (dinámicos — van después de las rutas específicas)
router.get("/", listar);
router.get("/:id", optionalAuth, obtener);
router.get("/:id/upsell", upsell);
router.get("/:id/progreso", getProgreso);
router.get("/:id/resenas", listarResenasCtrl);
router.get("/:id/compra/check", checkCompra);
router.get("/:id/favorito/check", authGuard, checkFav);

// Requieren auth (creador)
router.post("/", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(miniebookSchema), crear);
router.patch("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(miniebookSchema.partial()), editar);
router.patch("/:id/status", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(miniebookStatusSchema), cambiarEstado);
router.delete("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), eliminar);
router.post("/:id/generar", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), generar);

// Favoritos
router.post("/:id/favorito", authGuard, toggleFav);

// Progreso
router.post("/:id/progreso", optionalAuth, validate(progresoSchema), saveProgreso);

// Compras
router.post("/:id/comprar", authGuard, comprar);
router.post("/:id/comprar-invitado", invitadoLimiter, validate(compraInvitadoSchema), comprarInvitado);

// Reseñas
router.post("/:id/resenas", authGuard, validate(resenaSchema), crearResenaCtrl);

export default router;
