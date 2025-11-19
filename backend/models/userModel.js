import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // SAMPLE FIELDS – you can change later
    phone: { type: String },
    address: { type: String },
    skills: { type: [String], default: [] },
    documents: { type: [String], default: [] }, // file URLs
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
