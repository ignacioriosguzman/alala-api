import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { crearOrden, crearOrdenContenido, confirmarPago, retornoPago, estadoPago } from "./pagos.controller.js";

const router = express.Router();

router.post("/crear", authGuard, crearOrden);
router.post("/contenido/crear", authGuard, crearOrdenContenido);
router.post("/confirmacion", confirmarPago);   // webhook Flow — sin auth
router.get("/retorno", retornoPago);            // redirect Flow → frontend
router.get("/estado/:token", authGuard, estadoPago);

export default router;
