import express from "express";
import { getSchemes, getSchemeById, createScheme, updateScheme } from "../controllers/schemeController.js";

const router = express.Router();

router.get("/", getSchemes);
router.get("/:id", getSchemeById);

// Admin endpoints (should be protected in production)
router.post("/", createScheme);
router.put("/:id", updateScheme);

export default router;
