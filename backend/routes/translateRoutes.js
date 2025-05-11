import express from "express";
import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { translateCode } from "../controllers/translateController.js";

const router = Router();

router.post("/", protect, translateCode);

export default router;