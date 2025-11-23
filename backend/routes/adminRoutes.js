import express from "express";
import {
	loginAdmin,
	getSummary,
	getWorkers,
	getWorkerById,
	createWorker,
 	verifyWorker,
 	activateWorker,
 	deactivateWorker,
 	deleteWorker,
	getEmployers,
	getEmployerById,
	createEmployer,
	activateEmployer,
	deactivateEmployer,
	getJobs,
	createJob,
	updateJobStatus,
	deleteJob,
	getVerifications,
	getPendingDocuments,
	getAllDocuments,
	updateDocumentStatus,
	getPendingEmployerDocuments,
	getAllEmployerDocuments,
	updateEmployerDocumentStatus,
	getAdminLogs,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/summary", adminAuth, getSummary);

router.get("/workers", adminAuth, getWorkers);
router.get("/workers/:id", adminAuth, getWorkerById);
router.post("/workers", adminAuth, createWorker);
router.put("/workers/:id/verify", adminAuth, verifyWorker);
router.put("/workers/:id/activate", adminAuth, activateWorker);
router.put("/workers/:id/deactivate", adminAuth, deactivateWorker);
router.delete("/workers/:id", adminAuth, deleteWorker);

router.get("/employers", adminAuth, getEmployers);
router.post("/employers", adminAuth, createEmployer);
router.get("/employers/:id", adminAuth, getEmployerById);
router.put("/employers/:id/activate", adminAuth, activateEmployer);
router.put("/employers/:id/deactivate", adminAuth, deactivateEmployer);

router.get("/jobs", adminAuth, getJobs);
router.post("/jobs", adminAuth, createJob);
router.put("/jobs/:id/status", adminAuth, updateJobStatus);
router.delete("/jobs/:id", adminAuth, deleteJob);
router.get("/verifications", adminAuth, getVerifications);

router.get("/documents/pending", adminAuth, getPendingDocuments);
router.get("/documents", adminAuth, getAllDocuments);
router.put("/documents/:id/status", adminAuth, updateDocumentStatus);
// Employer documents admin
router.get("/employer-documents/pending", adminAuth, getPendingEmployerDocuments);
router.get("/employer-documents", adminAuth, getAllEmployerDocuments);
router.put("/employer-documents/:id/status", adminAuth, updateEmployerDocumentStatus);
router.get("/logs", adminAuth, getAdminLogs);

export default router;
