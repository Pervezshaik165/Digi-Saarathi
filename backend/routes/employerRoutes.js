import express from "express";
import {
	registerEmployer,
	loginEmployer,
	getProfile,
	updateProfile,
	searchWorker,
	createVerification,
	getVerifications,
	getRegisteredWorkers,
	getDashboardStats,
	createJob,
	updateJob,
	getJobs,
	getJobApplicants,
	uploadEmployerDocument,
	getEmployerDocuments,
	deleteEmployerDocument,
} from "../controllers/employerController.js";
import authEmployer from "../middleware/authEmployer.js";

const router = express.Router();

router.post("/register", registerEmployer);
router.post("/login", loginEmployer);

// Protected routes for employer
router.get("/profile", authEmployer, getProfile);
router.put("/profile", authEmployer, updateProfile);
router.get("/search-worker", authEmployer, searchWorker);
router.post("/verification", authEmployer, createVerification);
router.get("/verifications", authEmployer, getVerifications);
router.get("/workers/list", authEmployer, getRegisteredWorkers);
router.get("/dashboard/stats", authEmployer, getDashboardStats);
router.post("/job", authEmployer, createJob);
router.put("/job/:jobId", authEmployer, updateJob);
router.get("/jobs", authEmployer, getJobs);
router.get("/job/:jobId/applicants", authEmployer, getJobApplicants);

// Employer document management
router.post("/documents", authEmployer, uploadEmployerDocument);
router.get("/documents", authEmployer, getEmployerDocuments);
router.delete("/documents/:id", authEmployer, deleteEmployerDocument);

export default router;
