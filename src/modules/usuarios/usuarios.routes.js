import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { listar, obtener, obtenerPublico, actualizar, eliminar } from "./usuarios.controller.js";

const router = express.Router();

router.get("/", authGuard, roleGuard("ADMIN"), listar);
router.get("/publico/:id", obtenerPublico);
router.get("/:id", authGuard, obtener);
router.put("/:id", authGuard, actualizar);
router.delete("/:id", authGuard, roleGuard("ADMIN"), eliminar);

export default router;
