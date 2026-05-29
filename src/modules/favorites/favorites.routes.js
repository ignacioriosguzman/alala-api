import express from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { toggle, listar, check } from "./favorites.controller.js";

const router = express.Router();

router.post("/", authGuard, toggle);
router.get("/", authGuard, listar);
router.get("/check/:courseId", authGuard, check);

export default router;
