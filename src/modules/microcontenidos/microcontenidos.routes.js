import express from "express";
import rateLimit from "express-rate-limit";
import { authGuard, optionalAuth } from "../../middlewares/authGuard.js";
import { roleGuard } from "../../middlewares/roleGuard.js";
import { validate } from "../../middlewares/validate.js";
import { microcontenidoSchema, microcontenidoPublicadoSchema, progresoSchema, compraInvitadoSchema } from "../../validators/schemas.js";
import {
  crear,
  listar,
  porTipo,
  obtener,
  misMicros,
  editar,
  cambiarPublicado,
  eliminar,
  upsell,
  toggleFavorito,
  misFavoritos,
  checkFavorito,
  guardarProgreso,
  obtenerProgreso,
  comprar,
  comprarInvitado,
  checkCompra,
  misCompras,
} from "./microcontenidos.controller.js";

const router = express.Router();

const invitadoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta más tarde." },
});

// Rutas específicas PRIMERO (antes de /:id para evitar conflictos)
router.get("/mis-microcontenidos", authGuard, misMicros);
router.get("/favoritos/mis-favoritos", authGuard, misFavoritos);
router.get("/mis-compras", authGuard, misCompras);

// Públicos
router.get("/", listar);
router.get("/tipo/:tipo", porTipo);
router.get("/:id", optionalAuth, obtener);
router.get("/:id/upsell", upsell);
router.get("/:id/progreso", obtenerProgreso);
router.get("/:id/favorito/check", authGuard, checkFavorito);
router.get("/:id/compra/check", checkCompra);

// Requieren auth
router.post("/", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(microcontenidoSchema), crear);
router.patch("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(microcontenidoSchema.partial()), editar);
router.patch("/:id/publicado", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), validate(microcontenidoPublicadoSchema), cambiarPublicado);
router.delete("/:id", authGuard, roleGuard("INSTRUCTOR", "CREATOR", "ADMIN"), eliminar);

// Favoritos y progreso
router.post("/:id/favorito", authGuard, toggleFavorito);
router.post("/:id/progreso", optionalAuth, validate(progresoSchema), guardarProgreso);

// Compras
router.post("/:id/comprar", authGuard, comprar);
router.post("/:id/comprar-invitado", invitadoLimiter, validate(compraInvitadoSchema), comprarInvitado);

export default router;
