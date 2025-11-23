import Scheme from "../models/schemeModel.js";

// GET /api/schemes
export const getSchemes = async (req, res) => {
  try {
    const { state, scope, eligible, page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (state) filter["state.code"] = state;
    if (scope) filter.scope = scope;
    if (q) filter.$text = { $search: q };

    // For MVP, `eligible` is not computed here; frontend can call /api/schemes?eligible=true later.
    const schemes = await Scheme.find(filter)
      .sort({ updated_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Scheme.countDocuments(filter);
    res.json({ data: schemes, page: Number(page), total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching schemes" });
  }
};

// GET /api/schemes/:id
export const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.json(scheme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: POST /api/schemes (create)
export const createScheme = async (req, res) => {
  try {
    const data = req.body;
    const scheme = new Scheme(data);
    await scheme.save();
    res.status(201).json(scheme);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating scheme" });
  }
};

// Admin: PUT /api/schemes/:id (update)
export const updateScheme = async (req, res) => {
  try {
    const updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating scheme" });
  }
};
