import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Employer from "../models/employerModel.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing email or password",
      });
    }

    // Compare with .env
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Generate token
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      token,
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET /api/admin/summary
export const getSummary = async (req, res) => {
  try {
    const totalWorkers = await User.countDocuments();
    const totalEmployers = await Employer.countDocuments();

    // Basic placeholders for things not yet modeled in DB
    const pendingEmployers = 0;
    const pendingDocs = 0;
    const jobsPosted = 0;
    const verificationsGiven = 0;

    const recent = [
      { id: 1, text: "Work verification: Rajesh Kumar — Plumber — Kiran Traders Pvt Ltd", date: new Date().toLocaleString() },
      { id: 2, text: "Work verification: Fatima Bano — Mason — Sunrise Constructions", date: new Date().toLocaleString() },
    ];

    return res.status(200).json({
      success: true,
      summary: { totalWorkers, totalEmployers, pendingEmployers, pendingDocs, jobsPosted, verificationsGiven },
      recent,
      message: "Logged in successfully as admin.",
    });
  } catch (error) {
    console.error("Admin summary error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
};
