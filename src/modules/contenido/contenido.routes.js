import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import {
  crear,
  catalogo,
  obtener,
  misContenidos,
  editar,
  cambiarEstado,
  eliminar,
  upsell,
} from "./contenido.controller.js";

const router = express.Router();

router.post("/", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), crear);
router.get("/catalogo", catalogo);
router.get("/mis-contenidos", authGuard, misContenidos);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.patch("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), editar);
router.patch("/:id/status", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), cambiarEstado);
router.delete("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), eliminar);

export default router;
