import express from "express";
import { geocode } from "./geocoding.controller.js";

const router = express.Router();

router.post("/geocode", geocode);

export default router;
