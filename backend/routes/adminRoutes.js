import express from "express";
import { loginAdmin, getSummary } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/summary", adminAuth, getSummary);

export default router;
