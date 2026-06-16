import express from "express";
import { authGuard, optionalAuth } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { validate } from "../../middlewares/validate.js";
import { contenidoSchema, contenidoStatusSchema } from "../../validators/schemas.js";
import {
  crear,
  catalogo,
  obtener,
  portada,
  misContenidos,
  editar,
  cambiarEstado,
  eliminar,
  upsell,
} from "./contenido.controller.js";

const router = express.Router();

router.post("/", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(contenidoSchema), crear);
router.get("/catalogo", catalogo);
router.get("/mis-contenidos", authGuard, misContenidos);
router.get("/:id/portada", portada);
router.get("/:id", optionalAuth, obtener);
router.get("/:id/upsell", upsell);
router.patch("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(contenidoSchema.partial()), editar);
router.patch("/:id/status", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(contenidoStatusSchema), cambiarEstado);
router.delete("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), eliminar);

export default router;
