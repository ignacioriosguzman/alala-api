import { getVentasInstructor, getVentasAdmin } from './ventas.service.js';

// GET /api/v1/instructor/ventas  — para el instructor autenticado
export const ventasInstructor = async (req, res) => {
  try {
    const data = await getVentasInstructor(req.user.id);
    res.json(data);
  } catch (err) {
    console.error('[ventas] ventasInstructor:', err.message);
    res.status(500).json({ error: 'Error obteniendo ventas' });
  }
};

// GET /api/v1/admin/ventas  — solo para administradores
export const ventasAdmin = async (req, res) => {
  try {
    const data = await getVentasAdmin();
    res.json(data);
  } catch (err) {
    console.error('[ventas] ventasAdmin:', err.message);
    res.status(500).json({ error: 'Error obteniendo ventas' });
  }
};
