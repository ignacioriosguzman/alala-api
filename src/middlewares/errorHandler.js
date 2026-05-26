export const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]", err);

  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Error de validación en la base de datos",
      code: "VALIDATION_ERROR",
    });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    return res.status(400).json({
      status: "error",
      message: "Error en la base de datos",
      code: err.code,
    });
  }

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
    code: err.code || "INTERNAL_ERROR",
  });
};
