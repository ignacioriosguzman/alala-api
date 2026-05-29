import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
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

// Públicos
router.get("/", listar);
router.get("/tipo/:tipo", porTipo);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.get("/:id/progreso", obtenerProgreso);

// Requieren auth
router.post("/", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), crear);
router.get("/mis-microcontenidos", authGuard, misMicros);
router.patch("/:id", authGuard, editar);
router.patch("/:id/publicado", authGuard, cambiarPublicado);
router.delete("/:id", authGuard, eliminar);

// Favoritos
router.post("/:id/favorito", authGuard, toggleFavorito);
router.get("/favoritos/mis-favoritos", authGuard, misFavoritos);
router.get("/:id/favorito/check", authGuard, checkFavorito);

// Progreso
router.post("/:id/progreso", guardarProgreso);

// Compras
router.post("/:id/comprar", authGuard, comprar);
router.post("/:id/comprar-invitado", comprarInvitado);
router.get("/:id/compra/check", checkCompra);
router.get("/mis-compras", authGuard, misCompras);

export default router;
