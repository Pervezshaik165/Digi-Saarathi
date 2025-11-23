import employerModel from "../models/employerModel.js";
import userModel from "../models/userModel.js";
import workVerificationModel from "../models/workVerificationModel.js";
import jobModel from "../models/jobModel.js";
import DocumentModel from "../models/documentModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import EmployerDocument from "../models/employerDocumentModel.js";

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
      isActive: false,
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

    // Allow login only if account is active
    if (!employer.isActive) {
      return res.status(401).json({ success: false, message: 'Your employer account is not active. Contact admin.' });
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

// GET EMPLOYER PROFILE
export const getProfile = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const employer = await employerModel.findById(employerId).select("-password");
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found" });
    }
    return res.status(200).json({ success: true, employer });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE EMPLOYER PROFILE
export const updateProfile = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const { company, phone, address, industry, location } = req.body;
    const updateData = {};
    if (company) updateData.company = company;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (industry) updateData.industry = industry;
    if (location) updateData.location = location;

    const employer = await employerModel.findByIdAndUpdate(
      employerId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({ success: true, employer });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// SEARCH WORKER BY VERIFICATION CODE OR PHONE
export const searchWorker = async (req, res) => {
  try {
    const { verificationCode, phone } = req.query;

    if (!verificationCode && !phone) {
      return res.status(400).json({ success: false, message: "Please provide verification code or phone number" });
    }

    let worker;
    if (verificationCode) {
      worker = await userModel.findOne({ verificationCode }).select("-password");
    } else if (phone) {
      worker = await userModel.findOne({ phone }).select("-password");
    }

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    return res.status(200).json({ success: true, worker });
  } catch (error) {
    console.error("Search worker error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE WORK VERIFICATION
export const createVerification = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const {
      employeeName,
      phoneNumber,
      jobRole,
      typeOfWork,
      skills,
      experience,
      startDate,
      endDate,
      rating,
      recommended,
      feedback,
    } = req.body;

    if (!employeeName || !phoneNumber || !jobRole || !typeOfWork || !experience || !startDate || !endDate || !rating || !recommended || !feedback) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const employer = await employerModel.findById(employerId);
    if (!employer) {
      return res.status(404).json({ success: false, message: "Employer not found" });
    }

    let workerId = null;
    const existingWorker = await userModel.findOne({ phone: phoneNumber });
    if (existingWorker) workerId = existingWorker._id;

    const qrToken = crypto.randomBytes(32).toString("hex");

    const verification = await workVerificationModel.create({
      qrToken,
      worker: workerId,
      employer: employerId,
      employeeName,
      phoneNumber,
      jobRole,
      typeOfWork,
      skills: skills || [],
      experience,
      startDate,
      endDate,
      rating,
      recommended,
      feedback,
      companyName: employer.company,
    });

    if (workerId) {
      await verification.populate("worker", "name email phone");
      // mark that this user now has a skill-certificate / verification present
      try {
        const user = await userModel.findById(workerId);
        if (user && !user.skillCertificatePresent) {
          user.skillCertificatePresent = true;
          await user.save();
        }
      } catch (e) {
        console.error('Failed to update user skillCertificatePresent', e);
      }
    }
    await verification.populate("employer", "company email");

    return res.status(201).json({ success: true, verification, qrToken: verification.qrToken });
  } catch (error) {
    console.error("Create verification error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET VERIFICATIONS GIVEN BY EMPLOYER
export const getVerifications = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const verifications = await workVerificationModel
      .find({ employer: employerId })
      .populate("worker", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, verifications });
  } catch (error) {
    console.error("Get verifications error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET registered workers list for employer dropdown
export const getRegisteredWorkers = async (req, res) => {
  try {
    // return lightweight list of users (id, name, phone)
    const users = await userModel.find().select('name phone').sort({ name: 1 }).lean();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get registered workers error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const [verificationsCount, jobsCount, recentVerifications] = await Promise.all([
      workVerificationModel.countDocuments({ employer: employerId }),
      jobModel.countDocuments({ employer: employerId }),
      workVerificationModel
        .find({ employer: employerId })
        .populate("worker", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const recentJobs = await jobModel
      .find({ employer: employerId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Count employer documents and verified docs
    const docs = await EmployerDocument.find({ employerId });
    const documentsUploaded = docs.length;
    const documentsVerifiedCount = docs.filter((d) => (d.status || '').toString().toLowerCase() === 'verified').length;

    return res.status(200).json({
      success: true,
      stats: {
        verificationsGiven: verificationsCount,
        jobsPosted: jobsCount,
        documentsVerified: documentsVerifiedCount,
        documentsUploaded,
      },
      recentVerifications,
      recentJobs,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE JOB
export const createJob = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const { title, location, salaryRange, requiredSkills, experience, jobType, description } = req.body;
    if (!title || !location || !jobType) {
      return res.status(400).json({ success: false, message: "Missing required fields: title, location, jobType" });
    }

    // Require that the employer has uploaded at least one document and
    // that none of the uploaded documents are pending or rejected.
    try {
      const docs = await EmployerDocument.find({ employerId });
      if (!docs || docs.length === 0) {
        return res.status(403).json({ success: false, message: 'You must upload at least one employer document before posting jobs. Please upload documents and wait for admin verification.' });
      }

      // if any doc is not verified, block (i.e., pending or rejected)
      const hasNonVerified = docs.some((d) => ((d.status || '').toString().toLowerCase() !== 'verified'));
      if (hasNonVerified) {
        return res.status(403).json({ success: false, message: 'All uploaded documents must be verified before posting jobs. Some documents are pending or rejected. Please re-upload or wait for admin verification.' });
      }
    } catch (err) {
      console.error('Error checking employer documents before createJob', err);
      return res.status(500).json({ success: false, message: 'Failed to verify employer documents' });
    }

    const job = await jobModel.create({
      employer: employerId,
      title,
      location,
      salaryRange: salaryRange || {},
      requiredSkills: requiredSkills || [],
      experience: experience || "",
      jobType,
      description: description || "",
    });

    await job.populate("employer", "company");

    return res.status(201).json({ success: true, job });
  } catch (error) {
    console.error("Create job error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE JOB (employer can edit their job)
export const updateJob = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const { jobId } = req.params;
    const { title, location, salaryRange, requiredSkills, experience, jobType, description, status } = req.body;

    const job = await jobModel.findOne({ _id: jobId, employer: employerId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (title) job.title = title;
    if (location) job.location = location;
    if (salaryRange) job.salaryRange = salaryRange;
    if (requiredSkills) job.requiredSkills = requiredSkills;
    if (experience !== undefined) job.experience = experience;
    if (jobType) job.jobType = jobType;
    if (description !== undefined) job.description = description;
    if (status && ['active','closed'].includes(status)) job.status = status;

    await job.save();

    await job.populate('employer', 'company');

    return res.status(200).json({ success: true, job });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET JOBS POSTED BY EMPLOYER
export const getJobs = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const jobs = await jobModel
      .find({ employer: employerId })
      .populate("applicants.worker", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error("Get jobs error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET JOB APPLICANTS
export const getJobApplicants = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const { jobId } = req.params;

    const job = await jobModel
      .findOne({ _id: jobId, employer: employerId })
      .populate("applicants.worker", "name email phone skills address");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    return res.status(200).json({ success: true, applicants: job.applicants || [] });
  } catch (error) {
    console.error("Get job applicants error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE APPLICANT STATUS (accept / reject)
export const updateApplicantStatus = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const { jobId, applicantId } = req.params;
    const { status } = req.body; // expected: 'accepted' or 'rejected'

    if (!['accepted', 'rejected', 'applied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const job = await jobModel.findOne({ _id: jobId, employer: employerId });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const applicant = job.applicants.id(applicantId) || job.applicants.find(a => String(a._id) === String(applicantId) || String(a.worker) === String(applicantId));
    if (!applicant) return res.status(404).json({ success: false, message: 'Applicant not found' });

    applicant.status = status;
    await job.save();

    return res.status(200).json({ success: true, message: 'Applicant status updated', applicant });
  } catch (error) {
    console.error('Update applicant status error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET a user's documents for employer view
export const getUserDocumentsForEmployer = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId; // auth only
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ success: false, message: 'Missing user id' });

    const docs = await DocumentModel.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, documents: docs });
  } catch (error) {
    console.error('Get user documents for employer error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------
// Employer Document Management
// ------------------------------
export const uploadEmployerDocument = async (req, res) => {
  try {
    const { fileUrl, type } = req.body;

    if (!fileUrl || !type) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const employerId = req.body.employerId || req.employerId;

    // Replace existing doc of same type
    const existing = await EmployerDocument.findOne({ employerId, type });
    if (existing) {
      await EmployerDocument.findByIdAndDelete(existing._id);
    }

    const doc = await EmployerDocument.create({ employerId, url: fileUrl, type, status: "pending" });

    return res.status(201).json({ success: true, message: existing ? "Document replaced" : "Document uploaded", document: doc });
  } catch (error) {
    console.error("uploadEmployerDocument error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployerDocuments = async (req, res) => {
  try {
    const employerId = req.body.employerId || req.employerId;
    const docs = await EmployerDocument.find({ employerId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, documents: docs });
  } catch (error) {
    console.error("getEmployerDocuments error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployerDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.body.employerId || req.employerId;

    const doc = await EmployerDocument.findOne({ _id: id, employerId });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    await EmployerDocument.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Document deleted" });
  } catch (error) {
    console.error("deleteEmployerDocument error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
