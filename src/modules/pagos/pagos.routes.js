import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import {
  crearOrden, crearOrdenContenido, crearOrdenMicro, crearOrdenEbook,
  confirmarPago, retornoPago, estadoPago,
} from "./pagos.controller.js";

const router = express.Router();

router.post("/crear", authGuard, crearOrden);
router.post("/contenido/crear", authGuard, crearOrdenContenido);
router.post("/micro/crear", authGuard, crearOrdenMicro);
router.post("/ebook/crear", authGuard, crearOrdenEbook);
router.post("/confirmacion", confirmarPago);   // webhook Flow — sin auth
router.get("/retorno", retornoPago);           // redirect Flow → frontend
router.get("/estado/:token", authGuard, estadoPago);

export default router;
