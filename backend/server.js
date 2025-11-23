import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";

import userRoutes from "./routes/userRoutes.js";
import employerRoutes from "./routes/employerRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import { getPublicVerification } from "./controllers/publicController.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import schemeRoutes from "./routes/schemeRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",");

// Allow the custom `token` header used by the frontend and common auth headers
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true,
}));

// preflight will be handled by cors middleware applied above
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/schemes", schemeRoutes);

// Recommendation route (user-protected)
app.use("/api/user/recommendations", recommendationRoutes);


app.get("/", (req, res) => {
    res.send("Digi Saarathi's Backend is Running !!!");
});

// Public verification route (QR token)
app.get("/verify/:qrToken", getPublicVerification);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
