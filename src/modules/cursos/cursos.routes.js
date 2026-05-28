import express from "express";
import { listar, obtener, crear, actualizar, eliminar, upsell } from "./cursos.controller.js";

const router = express.Router();

router.get("/", listar);
router.get("/:id", obtener);
router.get("/:id/upsell", upsell);
router.post("/", crear);
router.put("/:id", actualizar);
router.patch("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;
