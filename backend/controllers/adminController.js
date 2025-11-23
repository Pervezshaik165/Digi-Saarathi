import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Employer from "../models/employerModel.js";
import Job from "../models/jobModel.js";
import Document from "../models/documentModel.js";
import EmployerDocument from "../models/employerDocumentModel.js";
import Log from "../models/logModel.js";
import WorkVerification from "../models/workVerificationModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";

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
      message: "Logged in successfully as admin.",
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
    const [totalWorkers, totalEmployers, jobsPosted, verificationsGiven] = await Promise.all([
      User.countDocuments(),
      Employer.countDocuments(),
      Job.countDocuments(),
      WorkVerification.countDocuments(),
    ]);

    // Documents pending (both user and employer)
    const [userPendingDocsCount, employerPendingDocs] = await Promise.all([
      Document.countDocuments({ status: 'pending' }),
      EmployerDocument.find({ status: 'pending' }).lean(),
    ]);

    const employerPendingDocsCount = Array.isArray(employerPendingDocs) ? employerPendingDocs.length : 0;

    // Employers pending: those who are deactivated OR have at least one pending employer document
    const inactiveEmployers = await Employer.find({ isActive: false }).select('_id').lean();
    const inactiveIds = new Set((inactiveEmployers || []).map((e) => String(e._id)));
    const pendingDocEmployerIds = new Set((employerPendingDocs || []).map((d) => String(d.employerId)));

    const unionIds = new Set([...inactiveIds, ...pendingDocEmployerIds]);
    const pendingEmployers = unionIds.size;

    const pendingDocs = (userPendingDocsCount || 0) + (employerPendingDocsCount || 0);

    // Recent admin logs (limit 10) and recent verifications (limit 5) merged into recent activities
    const [logs, recentVerifs] = await Promise.all([
      Log.find().sort({ createdAt: -1 }).limit(10).lean(),
      WorkVerification.find().populate('employer', 'company').populate('worker', 'name').sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const recentFromLogs = (logs || []).map((l) => ({ id: String(l._id), text: `${l.action} ${l.entityType}${l.details && l.details.title ? `: ${l.details.title}` : ''}`, date: l.createdAt }));

    const recentFromVerifs = (recentVerifs || []).map((v) => ({ id: String(v._id), text: `Work verification: ${v.employeeName} — ${v.jobRole} — ${v.employer ? v.employer.company : ''}`, date: v.createdAt }));

    // merge and sort by date desc, limit 10
    const recentMerged = [...recentFromVerifs, ...recentFromLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // Verification summary (last 5 verifications)
    const verificationSummary = (recentVerifs || []).map((v) => ({
      id: String(v._id),
      worker: v.employeeName,
      role: v.jobRole,
      employer: v.employer ? v.employer.company : '',
      date: v.createdAt,
    }));

    return res.status(200).json({
      success: true,
      summary: { totalWorkers, totalEmployers, pendingEmployers, pendingDocs, jobsPosted, verificationsGiven, verificationSummary },
      recent: recentMerged,
      message: "Admin summary fetched",
    });
  } catch (error) {
    console.error("Admin summary error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch summary" });
  }
};

// GET /api/admin/workers
export const getWorkers = async (req, res) => {
  try {
    const workers = await User.find().select("-password");
    return res.status(200).json({ success: true, workers });
  } catch (error) {
    console.error("Get workers error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch workers" });
  }
};

// GET /api/admin/workers/:id
export const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await User.findById(id).select("-password");
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });
    return res.status(200).json({ success: true, worker });
  } catch (error) {
    console.error("Get worker by id error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch worker" });
  }
};

// GET /api/admin/employers
export const getEmployers = async (req, res) => {
  try {
    const employers = await Employer.find().select("-password");
    return res.status(200).json({ success: true, employers });
  } catch (error) {
    console.error("Get employers error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch employers" });
  }
};

// GET /api/admin/employers/:id
export const getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;
    const employer = await Employer.findById(id).select("-password");
    if (!employer) return res.status(404).json({ success: false, message: "Employer not found" });
    return res.status(200).json({ success: true, employer });
  } catch (error) {
    console.error("Get employer by id error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch employer" });
  }
};

// PUT /api/admin/employers/:id/activate
export const activateEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employer.findById(id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employer not found' });

    emp.isActive = true;
    await emp.save();

    try {
      await Log.create({ action: 'update', entityType: 'employer', entityId: emp._id, details: { isActive: true }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for activateEmployer', e);
    }

    const out = await Employer.findById(id).select('-password');
    return res.status(200).json({ success: true, employer: out });
  } catch (error) {
    console.error('Activate employer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to activate employer' });
  }
};

// PUT /api/admin/employers/:id/deactivate
export const deactivateEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employer.findById(id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employer not found' });

    emp.isActive = false;
    await emp.save();

    try {
      await Log.create({ action: 'update', entityType: 'employer', entityId: emp._id, details: { isActive: false }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for deactivateEmployer', e);
    }

    const out = await Employer.findById(id).select('-password');
    return res.status(200).json({ success: true, employer: out });
  } catch (error) {
    console.error('Deactivate employer error:', error);
    return res.status(500).json({ success: false, message: 'Failed to deactivate employer' });
  }
};

// GET /api/admin/jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("employer", "company")
      .sort({ createdAt: -1 })
      .lean();

    // Map to lightweight shape expected by frontend
    const out = jobs.map((j) => ({
      id: String(j._id),
      title: j.title,
      employer: j.employer ? j.employer.company : "Unknown",
      category: j.jobType || j.location || "",
      status: j.status === "active" ? "Active" : "Inactive",
      postedAt: j.createdAt,
    }));

    return res.status(200).json({ success: true, jobs: out });
  } catch (error) {
    console.error("Get jobs error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

// POST /api/admin/jobs
export const createJob = async (req, res) => {
  try {
    const { title, location, jobType, employer, description, salaryRange = {}, requiredSkills = [], experience } = req.body;

    if (!title || !location || !jobType || !employer) {
      return res.status(400).json({ success: false, message: "Missing required fields for job" });
    }

    // verify employer exists
    const emp = await Employer.findById(employer);
    if (!emp) return res.status(404).json({ success: false, message: "Employer not found" });

    const job = await Job.create({
      employer,
      title,
      location,
      jobType,
      description,
      salaryRange,
      requiredSkills,
      experience,
      status: 'active',
    });

    const out = {
      id: String(job._id),
      title: job.title,
      employer: emp.company,
      category: job.jobType || job.location,
      status: job.status === 'active' ? 'Active' : 'Inactive',
      postedAt: job.createdAt,
    };

    // Log admin action
    try {
      await Log.create({ action: 'create', entityType: 'job', entityId: job._id, details: { title: job.title, employer: emp.company }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for createJob', e);
    }

    return res.status(201).json({ success: true, job: out, message: 'Job created' });
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create job' });
  }
};

// PUT /api/admin/jobs/:id/status
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expect 'active' or 'closed'

    if (!['active', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    job.status = status;
    await job.save();

    const populated = await Job.findById(id).populate('employer', 'company').lean();
    const out = {
      id: String(populated._id),
      title: populated.title,
      employer: populated.employer ? populated.employer.company : 'Unknown',
      category: populated.jobType || populated.location,
      status: populated.status === 'active' ? 'Active' : 'Inactive',
      postedAt: populated.createdAt,
    };

    // Log admin action
    try {
      await Log.create({ action: 'update', entityType: 'job', entityId: populated._id, details: { status }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for updateJobStatus', e);
    }

    return res.status(200).json({ success: true, job: out, message: 'Job status updated' });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update job status' });
  }
};

// DELETE /api/admin/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await Job.findByIdAndDelete(id);
    try {
      await Log.create({ action: 'delete', entityType: 'job', entityId: id, details: { title: job.title }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for deleteJob', e);
    }
    return res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete job' });
  }
};

// GET /api/admin/verifications
export const getVerifications = async (req, res) => {
  try {
    const sample = [
      { id: "v1", worker: "Worker One", employer: "Alice Co", role: "Plumber", rating: 4, date: new Date().toLocaleString() },
      { id: "v2", worker: "Worker Two", employer: "Bob Ltd", role: "Carpenter", rating: 5, date: new Date().toLocaleString() },
    ];
    return res.status(200).json({ success: true, logs: sample });
  } catch (error) {
    console.error("Get verifications error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch verifications" });
  }
};

// GET /api/admin/logs
export const getAdminLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).lean();

    const out = logs.map((l) => ({
      id: String(l._id),
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId ? String(l.entityId) : null,
      details: l.details || {},
      adminId: l.adminId ? String(l.adminId) : null,
      createdAt: l.createdAt,
    }));

    return res.status(200).json({ success: true, logs: out });
  } catch (error) {
    console.error('Get admin logs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
};

// Employer document endpoints for admin
export const getPendingEmployerDocuments = async (req, res) => {
  try {
    const docs = await EmployerDocument.find().populate("employerId", "company email").sort({ createdAt: -1 }).lean();

    const pending = docs.map((d) => ({
      id: String(d._id),
      type: d.type,
      owner: d.employerId ? d.employerId.company : "Unknown",
      ownerEmail: d.employerId ? d.employerId.email : "",
      uploadedAt: d.createdAt,
      status: d.status === "pending" ? "Pending" : d.status === "verified" ? "Verified" : "Rejected",
      url: d.url,
      employerId: d.employerId ? String(d.employerId._id) : null,
    }));

    return res.status(200).json({ success: true, pending });
  } catch (error) {
    console.error("Get pending employer documents error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch employer documents" });
  }
};

export const getAllEmployerDocuments = async (req, res) => {
  try {
    const docs = await EmployerDocument.find().populate("employerId", "company email").sort({ createdAt: -1 }).lean();

    const out = docs.map((d) => ({
      id: String(d._id),
      type: d.type,
      owner: d.employerId ? d.employerId.company : "Unknown",
      ownerEmail: d.employerId ? d.employerId.email : "",
      uploadedAt: d.createdAt,
      status: d.status === "pending" ? "Pending" : d.status === "verified" ? "Verified" : "Rejected",
      url: d.url,
      employerId: d.employerId ? String(d.employerId._id) : null,
    }));

    return res.status(200).json({ success: true, documents: out });
  } catch (error) {
    console.error("Get all employer documents error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch employer documents" });
  }
};

export const updateEmployerDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const doc = await EmployerDocument.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    doc.status = status;
    await doc.save();

    try {
      await Log.create({ action: 'update', entityType: 'employerDocument', entityId: doc._id, details: { status }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for updateEmployerDocumentStatus', e);
    }

    // Optionally update employer record if needed (not implemented)

    return res.status(200).json({ success: true, document: { id: String(doc._id), status } });
  } catch (error) {
    console.error('Update employer document status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update employer document status' });
  }
};

// GET /api/admin/documents/pending
export const getPendingDocuments = async (req, res) => {
  try {
    // Fetch documents from DB and return a lightweight shape for admin UI
    const docs = await Document.find().populate("userId", "name email").sort({ createdAt: -1 }).lean();

    const pending = docs.map((d) => ({
      id: String(d._id),
      type: d.type,
      owner: d.userId ? d.userId.name : "Unknown",
      ownerEmail: d.userId ? d.userId.email : "",
      uploadedAt: d.createdAt,
      status: d.status === "pending" ? "Pending" : d.status === "verified" ? "Verified" : "Rejected",
      url: d.url,
      userId: d.userId ? String(d.userId._id) : null,
    }));

    return res.status(200).json({ success: true, pending });
  } catch (error) {
    console.error("Get pending documents error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
};

// GET /api/admin/documents
export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find().populate("userId", "name email").sort({ createdAt: -1 }).lean();

    const out = docs.map((d) => ({
      id: String(d._id),
      type: d.type,
      owner: d.userId ? d.userId.name : "Unknown",
      ownerEmail: d.userId ? d.userId.email : "",
      uploadedAt: d.createdAt,
      status: d.status === "pending" ? "Pending" : d.status === "verified" ? "Verified" : "Rejected",
      url: d.url,
      userId: d.userId ? String(d.userId._id) : null,
    }));

    return res.status(200).json({ success: true, documents: out });
  } catch (error) {
    console.error("Get documents error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
};

// PUT /api/admin/documents/:id/status
export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expect 'verified' or 'rejected'

    if (!["verified", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    doc.status = status;
    await doc.save();

    // Log document status change
    try {
      await Log.create({ action: 'update', entityType: 'document', entityId: doc._id, details: { status }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for updateDocumentStatus', e);
    }

    // update user documentVerificationStatus for convenience
    if (doc.userId) {
      const user = await User.findById(doc.userId);
      if (user) {
        user.documentVerificationStatus = status === "verified" ? "verified" : status === "rejected" ? "rejected" : "pending";
        await user.save();
      }
    }

    return res.status(200).json({ success: true, document: { id: String(doc._id), status } });
  } catch (error) {
    console.error("Update document status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update document status" });
  }
};

// POST /api/admin/workers  (admin creates a worker)
export const createWorker = async (req, res) => {
  try {
    const { name, email, password, phone, address, skills = [] , verified = false } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      skills,
      verified: !!verified,
      status: verified ? 'verified' : 'pending',
      isActive: verified ? true : false,
      documentVerificationStatus: 'pending',
      skillCertificatePresent: false,
    });

    const out = user.toObject();
    delete out.password;

    // Log worker creation
    try {
      await Log.create({ action: 'create', entityType: 'worker', entityId: user._id, details: { name: user.name, email: user.email }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for createWorker', e);
    }

    return res.status(201).json({ success: true, user: out });
  } catch (error) {
    console.error("Create worker error:", error);
    return res.status(500).json({ success: false, message: "Failed to create worker" });
  }
};

// POST /api/admin/employers  (admin creates an employer)
export const createEmployer = async (req, res) => {
  try {
    const { company, name, email, password, phone, location, industry, isActive = false } = req.body;

    if (!company || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const exists = await Employer.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const emp = await Employer.create({
      company,
      name,
      email,
      password: hashed,
      phone,
      location,
      industry,
      isActive: !!isActive,
    });

    const out = emp.toObject();
    delete out.password;

    try {
      await Log.create({ action: 'create', entityType: 'employer', entityId: emp._id, details: { company: emp.company, email: emp.email }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for createEmployer', e);
    }

    return res.status(201).json({ success: true, employer: out });
  } catch (error) {
    console.error("Create employer error:", error);
    return res.status(500).json({ success: false, message: "Failed to create employer" });
  }
};

// PUT /api/admin/workers/:id/verify
export const verifyWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await User.findById(id);
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });

    worker.verified = true;
    worker.status = 'verified';
    await worker.save();

    try {
      await Log.create({ action: 'verify', entityType: 'worker', entityId: worker._id, details: { verified: true }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for verifyWorker', e);
    }

    const out = await User.findById(id).select("-password");
    return res.status(200).json({ success: true, worker: out });
  } catch (error) {
    console.error("Verify worker error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify worker" });
  }
};

// PUT /api/admin/workers/:id/activate
export const activateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await User.findById(id);
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });

    worker.isActive = true;
    await worker.save();

    try {
      await Log.create({ action: 'update', entityType: 'worker', entityId: worker._id, details: { isActive: true }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for activateWorker', e);
    }

    const out = await User.findById(id).select("-password");
    return res.status(200).json({ success: true, worker: out });
  } catch (error) {
    console.error("Activate worker error:", error);
    return res.status(500).json({ success: false, message: "Failed to activate worker" });
  }
};

// PUT /api/admin/workers/:id/deactivate
export const deactivateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await User.findById(id);
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });

    worker.isActive = false;
    await worker.save();

    try {
      await Log.create({ action: 'update', entityType: 'worker', entityId: worker._id, details: { isActive: false }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for deactivateWorker', e);
    }

    const out = await User.findById(id).select("-password");
    return res.status(200).json({ success: true, worker: out });
  } catch (error) {
    console.error("Deactivate worker error:", error);
    return res.status(500).json({ success: false, message: "Failed to deactivate worker" });
  }
};

// DELETE /api/admin/workers/:id
export const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await User.findById(id);
    if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });

    await User.findByIdAndDelete(id);
    try {
      await Log.create({ action: 'delete', entityType: 'worker', entityId: id, details: { name: worker.name, email: worker.email }, adminId: req.adminId || null, ip: req.ip });
    } catch (e) {
      console.error('Failed to create log for deleteWorker', e);
    }
    return res.status(200).json({ success: true, message: "Worker deleted" });
  } catch (error) {
    console.error("Delete worker error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete worker" });
  }
};

