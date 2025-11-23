import mongoose from "mongoose";

const employerDocumentSchema = new mongoose.Schema(
  {
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employer", required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    }
  },
  { timestamps: true }
);

export default mongoose.model("EmployerDocument", employerDocumentSchema);
