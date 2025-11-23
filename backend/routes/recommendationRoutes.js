import express from "express";
import authUser from "../middleware/authUser.js";
import jobRecommendation from "../controllers/jobRecommendation.js";

const router = express.Router();

// POST /api/user/recommendations/  (protected)
router.post("/", authUser, jobRecommendation.getJobRecommendations);

export default router;
