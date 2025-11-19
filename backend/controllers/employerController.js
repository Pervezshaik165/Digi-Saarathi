import employerModel from "../models/employerModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✔ REGISTER EMPLOYER
export const registerEmployer = async (req, res) => {
  try {
    const { company, email, password } = req.body;

    if (!company || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const exists = await employerModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const employer = await employerModel.create({
      company,
      email,
      password: hashed,
    });

    const token = jwt.sign({ id: employer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({ success: true, token });

  } catch (error) {
    console.error("Employer register error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✔ LOGIN EMPLOYER
export const loginEmployer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employer = await employerModel.findOne({ email });
    if (!employer) {
      return res.status(401).json({
        success: false,
        message: "Employer does not exist",
      });
    }

    const match = await bcrypt.compare(password, employer.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: employer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ success: true, token });

  } catch (error) {
    console.error("Employer login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
