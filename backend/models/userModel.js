import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
      // Profile fields
      phone: { type: String },
      image: { type: String }, // profile picture URL
      dob: { type: Date },
      gender: { type: String },
      originState: { type: String },
      originDistrict: { type: String },
      currentState: { type: String },
      currentDistrict: { type: String },
      presentCity: { type: String },
      experience: { type: String },
      address: { type: String },
      skills: { type: [String], default: [] },
      documents: { type: [String], default: [] }, // file URLs
      // Admin / verification fields
      verified: { type: Boolean, default: false },
      status: { type: String, enum: ["pending", "verified"], default: "pending" },
      isActive: { type: Boolean, default: false },
      role: { type: String, enum: ["user", "employer", "admin"], default: "user" },
      // Document and certificate statuses
      documentVerificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
      skillCertificatePresent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
