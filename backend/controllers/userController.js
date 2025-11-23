import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DocumentModel from "../models/documentModel.js";
import workVerificationModel from "../models/workVerificationModel.js";

// ✔ REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashed,
      verified: false,
      status: 'pending',
      isActive: false,
      documentVerificationStatus: 'pending',
      skillCertificatePresent: false,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("User register error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✔ LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exist",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Prevent login if account is deactivated or still pending verification
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account is deactivated or still not activated by admin. Contact admin for assistance.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("User login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
//  UPLOAD DOCUMENT (URL already uploaded to Cloudinary)
// ------------------------------
// ------------------------------
//  UPLOAD / REPLACE DOCUMENT
// ------------------------------
export const uploadUserDocument = async (req, res) => {
  try {
    const { fileUrl, type } = req.body;

    if (!fileUrl || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    // Check if user already has a document of this type
    const existingDoc = await DocumentModel.findOne({
      userId: req.userId,
      type
    });

    // If exists, delete the previous one (but optional: we can skip)
    if (existingDoc) {
      await DocumentModel.findByIdAndDelete(existingDoc._id);
    }

    // Create new document
    const newDoc = await DocumentModel.create({
      userId: req.userId,
      url: fileUrl,
      type,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: existingDoc ? "Document replaced" : "Document uploaded",
      document: newDoc
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ------------------------------
//  GET USER DOCUMENTS
// ------------------------------
export const getUserDocuments = async (req, res) => {
  try {
    const docs = await DocumentModel.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      documents: docs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ------------------------------
//  DELETE DOCUMENT
// ------------------------------
export const deleteUserDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await DocumentModel.findOne({
      _id: id,
      userId: req.userId
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    await DocumentModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name, phone, address, skills,
      originState, originDistrict,
      currentState, currentDistrict,
      dob, gender, image,
      presentCity, experience
    } = req.body;

    console.log("[updateProfile] received body:", req.body);

    const payload = {
      name, phone, address, skills,
      originState, originDistrict,
      currentState, currentDistrict,
      presentCity, experience
    };

    // Only set dob if provided and non-empty; convert to Date object for mongoose
    if (typeof dob !== "undefined" && dob !== null && dob !== "") {
      const parsed = new Date(dob);
      if (!isNaN(parsed.getTime())) payload.dob = parsed;
    }

    if (image) payload.image = image;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.userId,
      payload,
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

// GET user's verifications / certificates
export const getUserVerifications = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing user' });

    const verifications = await workVerificationModel
      .find({ worker: userId })
      .populate('employer', 'company email')
      .sort({ createdAt: -1 });

    // Map to useful fields and include public verification URL
    const mapped = verifications.map((v) => ({
      id: v._id,
      qrToken: v.qrToken,
      companyName: v.companyName || (v.employer && v.employer.company) || '',
      jobRole: v.jobRole,
      startDate: v.startDate,
      endDate: v.endDate,
      createdAt: v.createdAt,
      verificationUrl: `${req.protocol}://${req.get('host')}/verify/${v.qrToken}`,
    }));

    return res.status(200).json({ success: true, verifications: mapped });
  } catch (error) {
    console.error('Get user verifications error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
