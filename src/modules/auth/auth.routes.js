import express from "express";
import { register, registrarInstructor, login } from "./auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-instructor", registrarInstructor);
router.post("/login", login);

export default router;
