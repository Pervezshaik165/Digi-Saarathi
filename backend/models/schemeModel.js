import mongoose from "mongoose";

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  short_description: { type: String },
  full_description: { type: String },
  scope: { type: String, enum: ["central", "state"], default: "central" },
  state: {
    code: { type: String },
    name: { type: String },
  },
  categories: [{ type: String }],
  eligibility: { type: mongoose.Schema.Types.Mixed },
  eligibility_text: { type: String },
  benefit: {
    amount: { type: Number },
    frequency: { type: String },
    description: { type: String },
  },
  documents_required: [{ type: String }],
  apply_url: { type: String },
  info_url: { type: String },
  source: { type: String },
  source_id: { type: String },
  portability_notes: { type: String },
  contact_info: { type: mongoose.Schema.Types.Mixed },
  tags: [{ type: String }],
  verified: { type: Boolean, default: false },
  requires_manual_review: { type: Boolean, default: false },
  provenance: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

SchemeSchema.index({ source: 1, source_id: 1 }, { unique: false });

SchemeSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Scheme = mongoose.model("Scheme", SchemeSchema);

export default Scheme;
