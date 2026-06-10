import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { validate } from "../../middlewares/validate.js";
import { cursoSchema } from "../../validators/schemas.js";
import { listar, obtener, crear, actualizar, eliminar, upsell, misCursos, acceso } from "./cursos.controller.js";

const router = express.Router();

router.get("/mis-cursos", authGuard, misCursos);
router.get("/", listar);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.get("/:id/acceso", authGuard, acceso);
router.post("/", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(cursoSchema), crear);
router.put("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(cursoSchema.partial()), actualizar);
router.patch("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(cursoSchema.partial()), actualizar);
router.delete("/:id", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), eliminar);

export default router;
