import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { validate } from "../../middlewares/validate.js";
import { cursoSchema } from "../../validators/schemas.js";
import { listar, obtener, crear, actualizar, eliminar, upsell } from "./cursos.controller.js";

const router = express.Router();

router.get("/", listar);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.post("/", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), validate(cursoSchema), crear);
router.put("/:id", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), validate(cursoSchema.partial()), actualizar);
router.patch("/:id", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), validate(cursoSchema.partial()), actualizar);
router.delete("/:id", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), eliminar);

export default router;
