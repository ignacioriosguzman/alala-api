export const roleGuard = (...roles) => (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (req.user && adminEmail && req.user.email === adminEmail) return next();
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};
