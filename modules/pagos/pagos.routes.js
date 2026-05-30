import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { crearOrden, confirmarPago, retornoPago, estadoPago } from "./pagos.controller.js";

const router = express.Router();

router.post("/crear", authGuard, crearOrden);
router.post("/confirmacion", confirmarPago);   // webhook Flow — sin auth
router.get("/retorno", retornoPago);            // redirect Flow → frontend
router.get("/estado/:token", estadoPago);       // consulta pública de estado

export default router;
