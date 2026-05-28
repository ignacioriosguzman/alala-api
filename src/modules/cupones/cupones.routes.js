import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import {
  crear,
  misCupones,
  validar,
  desactivar,
} from "./cupones.controller.js";

const router = express.Router();

router.post("/", authGuard, crear);
router.get("/mis-cupones", authGuard, misCupones);
router.get("/validar", validar);
router.patch("/:id/desactivar", authGuard, desactivar);

export default router;
