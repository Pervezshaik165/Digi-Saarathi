import express from "express";
import {
	registerUser,
	loginUser,
	uploadUserDocument,
	getUserDocuments,
	deleteUserDocument,
	getProfile,
	updateProfile
,
  getUserVerifications
} from "../controllers/userController.js";

import authUser from "../middleware/authUser.js";

const router = express.Router();

// AUTH
router.post("/register", registerUser);
router.post("/login", loginUser);

// DOCUMENT MANAGEMENT (Protected)
router.post("/documents", authUser, uploadUserDocument);
router.get("/documents", authUser, getUserDocuments);
router.delete("/documents/:id", authUser, deleteUserDocument);

router.get("/profile", authUser, getProfile);
router.get("/verifications", authUser, getUserVerifications);
router.put("/update-profile", authUser, updateProfile);

export default router;
