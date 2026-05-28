import { registerUser, registerInstructor, loginUser } from "./auth.service.js";

// Helper: sanitiza errores inesperados de base de datos
const handleAuthError = (error, res) => {
  if (error.name?.startsWith('Prisma') || error.code?.startsWith('P')) {
    console.error('[Auth] Error de Prisma:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  res.status(400).json({ error: error.message });
};

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.json({ message: "Usuario registrado", user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const registrarInstructor = async (req, res) => {
  try {
    const user = await registerInstructor(req.body);
    res.status(201).json({ message: "Instructor registrado correctamente", user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } });
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    if (!result) return res.status(401).json({ error: "Credenciales inválidas" });
    res.json(result);
  } catch (error) {
    handleAuthError(error, res);
  }
};
