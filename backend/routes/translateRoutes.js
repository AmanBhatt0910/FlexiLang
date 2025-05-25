import express from "express";
import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { translateCode } from "../controllers/translateController.js";
import { typeCheck } from "../middlewares/typeCheck.js";

const router = Router();

router.post("/", protect, typeCheck, translateCode);

export default router;