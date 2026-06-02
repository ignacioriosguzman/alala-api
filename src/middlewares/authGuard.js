import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const authGuard = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, nombre: true, email: true, role: true, verificado: true, activo: true },
    });
    if (!user)        return res.status(401).json({ error: 'Token inválido o expirado' });
    if (!user.activo) return res.status(403).json({ error: 'Cuenta deshabilitada. Contacta soporte.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
