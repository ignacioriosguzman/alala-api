import { registerUser, loginUser } from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ status: "ok", message: "Usuario registrado", data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    if (!result) {
      return res.status(401).json({ status: "error", message: "Credenciales inválidas" });
    }

    res.json({ status: "ok", message: "Login exitoso", data: result });
  } catch (error) {
    next(error);
  }
};
