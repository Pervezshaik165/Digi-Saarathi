import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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

export default mongoose.model("Document", documentSchema);
