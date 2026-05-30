import express from 'express';
import { authGuard } from '../../middlewares/authGuard.js';
import { roleGuard } from '../../middlewares/roleGuard.js';
import { ventasInstructor, ventasAdmin } from './ventas.controller.js';

const router = express.Router();

router.get('/instructor/ventas', authGuard, roleGuard('INSTRUCTOR', 'ADMIN'), ventasInstructor);
router.get('/admin/ventas', authGuard, roleGuard('ADMIN'), ventasAdmin);

export default router;
