import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import {
  comprar,
  misDescargas,
  download,
  reporte,
  comprarInvitado,
  bundle,
  bundleInvitado,
  guardarProgresoHandler,
  obtenerProgresoHandler,
  favoritosContenido,
  toggleFavorito,
  checkFavorito,
} from "./compras.controller.js";

const router = express.Router();

router.post("/contenido", authGuard, comprar);
router.get("/mis-descargas", authGuard, misDescargas);
router.get("/contenido/:id/download", authGuard, download);
router.get("/reporte-creador", authGuard, reporte);
router.post("/contenido/invitado", comprarInvitado);
router.post("/bundle", authGuard, bundle);
router.post("/bundle/invitado", bundleInvitado);
router.post("/progreso", guardarProgresoHandler);
router.get("/progreso/:contenidoId", obtenerProgresoHandler);
router.get("/favoritos-contenido", authGuard, favoritosContenido);
router.post("/favoritos-contenido", authGuard, toggleFavorito);
router.get("/favoritos-contenido/check/:contenidoId", authGuard, checkFavorito);

export default router;
