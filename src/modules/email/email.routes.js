import express from "express";
import { enviarConfirmacion } from "./email.controller.js";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";

const router = express.Router();

router.post("/enviar-confirmacion", authGuard, roleGuard("ADMIN"), enviarConfirmacion);

export default router;
