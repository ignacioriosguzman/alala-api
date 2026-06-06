import express from "express";
import { authGuard, optionalAuth } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import {
  crear,
  listar,
  porTipo,
  obtener,
  misMicros,
  editar,
  cambiarPublicado,
  eliminar,
  upsell,
  toggleFavorito,
  misFavoritos,
  checkFavorito,
  guardarProgreso,
  obtenerProgreso,
  comprar,
  comprarInvitado,
  checkCompra,
  misCompras,
} from "./microcontenidos.controller.js";

const router = express.Router();

// Rutas específicas PRIMERO (antes de /:id para evitar conflictos)
router.get("/mis-microcontenidos", authGuard, misMicros);
router.get("/favoritos/mis-favoritos", authGuard, misFavoritos);
router.get("/mis-compras", authGuard, misCompras);

// Públicos
router.get("/", listar);
router.get("/tipo/:tipo", porTipo);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.get("/:id/progreso", obtenerProgreso);
router.get("/:id/favorito/check", authGuard, checkFavorito);
router.get("/:id/compra/check", checkCompra);

// Requieren auth
router.post("/", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), crear);
router.patch("/:id", authGuard, editar);
router.patch("/:id/publicado", authGuard, cambiarPublicado);
router.delete("/:id", authGuard, eliminar);

// Favoritos y progreso
router.post("/:id/favorito", authGuard, toggleFavorito);
router.post("/:id/progreso", optionalAuth, guardarProgreso);

// Compras
router.post("/:id/comprar", authGuard, comprar);
router.post("/:id/comprar-invitado", comprarInvitado);

export default router;
