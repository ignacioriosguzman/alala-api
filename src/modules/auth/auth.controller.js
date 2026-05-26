import { registerUser, loginUser } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.json({ message: "Usuario registrado", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    if (!result) return res.status(401).json({ error: "Credenciales inválidas" });

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
