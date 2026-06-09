import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { validate } from "../../middlewares/validate.js";
import { mensajeSchema } from "../../validators/schemas.js";
import { enviar, listarPorCurso, noLeidos, listarPorUsuario } from "./mensajes.controller.js";

const router = express.Router();

router.get("/", authGuard, listarPorUsuario);
router.post("/", authGuard, validate(mensajeSchema), enviar);
router.get("/curso/:cursoId", authGuard, listarPorCurso);
router.get("/no-leidos", authGuard, noLeidos);

export default router;
