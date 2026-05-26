import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js";
import cursosRoutes from "./modules/cursos/cursos.routes.js";

dotenv.config();

const app = express();

// CORS abierto para desarrollo/producción
app.use(cors());
app.use(express.json());

// Health check en /api/v1/health
app.get("/api/v1/health", (req, res) => res.json({ status: "ok", service: "ALALÁ API" }));

// Rutas bajo /api/v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/usuarios", usuariosRoutes);
app.use("/api/v1/cursos", cursosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ALALÁ API running on port ${PORT}`));
