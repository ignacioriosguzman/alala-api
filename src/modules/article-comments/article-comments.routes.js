import { Router } from "express";
import { listar, crear, aprobar, eliminar, listarPendientes } from "./article-comments.controller.js";
import { authGuard } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { validate } from "../../middlewares/validate.js";
import { articleCommentSchema } from "../../validators/schemas.js";

const router = Router();

router.get("/admin/pendientes", authGuard, roleGuard("ADMIN"), listarPendientes);
router.get("/:articuloId", listar);
router.post("/:articuloId", authGuard, validate(articleCommentSchema), crear);
router.patch("/:id/aprobar", authGuard, roleGuard("ADMIN"), aprobar);
router.delete("/:id", authGuard, roleGuard("ADMIN"), eliminar);

export default router;
