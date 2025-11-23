import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // SAMPLE FIELDS – editable later
    phone: { type: String },
    address: { type: String },
    industry: { type: String },
    location: { type: String },
    // activation flag: employers start deactivated by default
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Employer", employerSchema);
