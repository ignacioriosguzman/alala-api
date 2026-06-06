import express from "express";
import { authGuard, optionalAuth } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
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

// Públicos
router.get("/", listar);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.get("/:id/progreso", getProgreso);
router.get("/:id/resenas", listarResenasCtrl);
router.get("/:id/compra/check", checkCompra);

// Requieren auth (creador)
router.post("/", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), crear);
router.get("/mis-ebooks", authGuard, misEbooks);
router.patch("/:id", authGuard, editar);
router.patch("/:id/status", authGuard, cambiarEstado);
router.delete("/:id", authGuard, eliminar);
router.post("/:id/generar", authGuard, generar);

// Favoritos
router.post("/:id/favorito", authGuard, toggleFav);
router.get("/favoritos/mis-favoritos", authGuard, misFavoritos);
router.get("/:id/favorito/check", authGuard, checkFav);

// Progreso
router.post("/:id/progreso", optionalAuth, saveProgreso);

// Compras
router.post("/:id/comprar", authGuard, comprar);
router.post("/:id/comprar-invitado", comprarInvitado);
router.get("/mis-compras", authGuard, getMisCompras);

// Estadísticas
router.get("/estadisticas/mis-stats", authGuard, estadisticas);

// Reseñas
router.post("/:id/resenas", authGuard, crearResenaCtrl);

export default router;
