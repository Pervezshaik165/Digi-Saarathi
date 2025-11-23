import express from "express";
import { getPublicJobs, applyToJob } from "../controllers/publicController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();

// Public jobs listing
router.get("/jobs", getPublicJobs);

// Apply to a job (protected)
router.post("/jobs/:jobId/apply", authUser, applyToJob);

export default router;
