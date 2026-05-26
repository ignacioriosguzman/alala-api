import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import usuariosRoutes from "./modules/usuarios/usuarios.routes.js";
import cursosRoutes from "./modules/cursos/cursos.routes.js";
import pagosRoutes from "./modules/pagos/pagos.routes.js";
import ventasRoutes from "./modules/ventas/ventas.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // necesario para el webhook de Flow

app.get("/api/v1/health", (req, res) => res.json({ status: "ok", service: "ALALÁ API" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/usuarios", usuariosRoutes);
app.use("/api/v1/cursos", cursosRoutes);
app.use("/api/v1/pagos", pagosRoutes);
app.use("/api/v1", ventasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ALALÁ API running on port ${PORT}`));
