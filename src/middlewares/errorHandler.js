/**
 * Middleware global de manejo de errores.
 * Captura errores no manejados, los loguea internamente
 * y devuelve un mensaje genérico al cliente.
 */
export const errorHandler = (err, req, res, next) => {
  // JSON malformado (SyntaxError de body-parser)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[ERROR] JSON malformado:', err.message);
    return res.status(400).json({ error: 'JSON malformado en el body' });
  }

  // Log interno completo para debugging
  console.error('[ERROR]', err.name || 'Error', '-', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Errores de Prisma: nunca exponer detalles internos
  if (err.name?.startsWith('Prisma') || err.code?.startsWith('P')) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Si el error ya tiene un status code definido por el controlador, respetarlo
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode < 500 ? err.message : 'Error interno del servidor';

  res.status(statusCode).json({ error: message });
};

/**
 * Wrapper para controladores async.
 * Evita tener que poner try/catch en cada controlador.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
