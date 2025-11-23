import mongoose from "mongoose";

const workVerificationSchema = new mongoose.Schema(
  {
    qrToken: {
      type: String,
      required: true,
      unique: true
    },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
    employeeName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    jobRole: { type: String, required: true },
    typeOfWork: { type: String, required: true },
    skills: [{ type: String }],
    experience: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    recommended: {
      type: String,
      enum: ["Highly Recommend", "Recommend", "Neutral", "Not Recommend"],
      required: true
    },
    feedback: { type: String, required: true },
    companyName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("WorkVerification", workVerificationSchema, "work_verification");
