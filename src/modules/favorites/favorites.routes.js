import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { toggle, listar, check, eliminarFavorito } from "./favorites.controller.js";

const router = express.Router();

router.post("/", authGuard, toggle);
router.get("/", authGuard, listar);
router.get("/check/:courseId", authGuard, check);
router.delete('/:courseId', authGuard, eliminarFavorito);

export default router;
