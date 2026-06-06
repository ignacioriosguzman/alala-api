import { Router } from "express";
import { guardar, quitar, estado, listarMios } from "./article-favorites.controller.js";
import { authGuard } from "../../middlewares/authGuard.js";

const router = Router();

router.get("/", authGuard, listarMios);
router.get("/:articuloId/status", authGuard, estado);
router.post("/:articuloId", authGuard, guardar);
router.delete("/:articuloId", authGuard, quitar);

export default router;
