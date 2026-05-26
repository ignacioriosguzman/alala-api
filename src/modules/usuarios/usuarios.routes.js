import express from "express";
import { listar, obtener, actualizar, eliminar } from "./usuarios.controller.js";

const router = express.Router();

router.get("/", listar);
router.get("/:id", obtener);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;
