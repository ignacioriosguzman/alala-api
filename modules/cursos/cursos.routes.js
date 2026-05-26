import express from "express";
import { listar, obtener, crear, actualizar, eliminar } from "./cursos.controller.js";

const router = express.Router();

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;
