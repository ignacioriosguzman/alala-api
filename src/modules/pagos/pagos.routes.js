import express from 'express';
import { authGuard } from '../../middlewares/authGuard.js';
import { crearOrden, confirmarPago, retornoPago, estadoPago } from './pagos.controller.js';

const router = express.Router();

// Requiere usuario autenticado
router.post('/crear', authGuard, crearOrden);

// Flow llama a este endpoint para confirmar el pago (sin auth)
router.post('/confirmacion', confirmarPago);

// Flow redirige al usuario aquí tras el pago (sin auth, luego redirige al frontend)
router.get('/retorno', retornoPago);

// Consulta de estado desde el frontend
router.get('/estado/:token', authGuard, estadoPago);

export default router;
