import { Router } from "express";
import { seguir, dejarDeSeguir, seguidores, siguiendo } from "./follows.controller.js";
import { authGuard } from "../../middlewares/authGuard.js";

const router = Router();

router.post("/:seguidoId", authGuard, seguir);
router.delete("/:seguidoId", authGuard, dejarDeSeguir);
router.get("/:userId/seguidores", seguidores);
router.get("/:userId/siguiendo", siguiendo);

export default router;
