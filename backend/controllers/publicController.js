import workVerificationModel from "../models/workVerificationModel.js";
import jobModel from "../models/jobModel.js";
import userModel from "../models/userModel.js";

export const getPublicVerification = async (req, res) => {
  try {
    const { qrToken } = req.params;
    if (!qrToken) {
      return res.status(400).json({ success: false, message: "Missing token" });
    }

    const verification = await workVerificationModel
      .findOne({ qrToken })
      .populate("employer", "company email")
      .populate("worker", "name email phone");

    if (!verification) {
      return res.status(404).json({ success: false, message: "Verification not found" });
    }

    return res.status(200).json({ success: true, verification });
  } catch (error) {
    console.error("Get public verification error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET public jobs (all active jobs)
export const getPublicJobs = async (req, res) => {
  try {
    const jobs = await jobModel.find({ status: 'active' }).populate('employer', 'company').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    console.error('Get public jobs error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// APPLY to job (protected)
export const applyToJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;
    if (!jobId) return res.status(400).json({ success: false, message: 'Missing job id' });

    const job = await jobModel.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Check already applied
    const already = job.applicants && job.applicants.some(a => a.worker?.toString() === userId.toString());
    if (already) return res.status(400).json({ success: false, message: 'You have already applied to this job' });

    job.applicants = job.applicants || [];
    job.applicants.push({ worker: userId });
    await job.save();

    // optionally populate applicant info
    await job.populate('employer', 'company');

    return res.status(200).json({ success: true, message: 'Applied successfully' });
  } catch (error) {
    console.error('Apply to job error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
