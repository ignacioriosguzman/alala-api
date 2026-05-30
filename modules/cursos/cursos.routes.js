import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { listar, obtener, crear, actualizar, eliminar, upsell } from "./cursos.controller.js";

const router = express.Router();

router.get("/", listar);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.post("/", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), crear);
router.put("/:id", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), actualizar);
router.patch("/:id", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), actualizar);
router.delete("/:id", authGuard, roleGuard("INSTRUCTOR", "ADMIN"), eliminar);

export default router;
