import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
    // Job details
    title: { type: String, required: true },
    location: { type: String, required: true },
    salaryRange: {
      min: { type: Number },
      max: { type: Number }
    },
    requiredSkills: [{ type: String }],
    experience: { type: String },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true
    },
    description: { type: String },
    // Applicants
    applicants: [{
      worker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      appliedAt: { type: Date, default: Date.now }
    }],
    // Status
    status: { type: String, enum: ["active", "closed"], default: "active" },
    // Verification status (optional)
    verification: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema, "posted_jobs");
