export const roleGuard = (...roles) => (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  // NOTA DE SEGURIDAD: ADMIN_EMAIL actúa como bypass de emergencia.
  // Este comportamiento es intencional pero debe documentarse y rotarse periódicamente.
  if (req.user && adminEmail && req.user.email === adminEmail) return next();

  // CREATOR tiene los mismos permisos que INSTRUCTOR
  const userRole = req.user?.role;
  const effectiveRoles = roles.includes('INSTRUCTOR') && !roles.includes('CREATOR')
    ? [...roles, 'CREATOR']
    : roles;

  if (!req.user || !effectiveRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};
