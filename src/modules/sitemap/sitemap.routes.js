import express from "express";
import { generarSitemap } from "./sitemap.controller.js";

const router = express.Router();

router.get("/sitemap.xml", generarSitemap);

export default router;
