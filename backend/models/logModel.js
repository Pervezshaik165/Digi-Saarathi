import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    action: { type: String, required: true }, // e.g. 'create','update','delete','verify'
    entityType: { type: String, required: true }, // e.g. 'job','document','worker','employer'
    entityId: { type: mongoose.Schema.Types.ObjectId, required: false },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Log", logSchema);
