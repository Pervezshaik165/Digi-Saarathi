import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";

import userRoutes from "./routes/userRoutes.js";
import employerRoutes from "./routes/employerRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);


app.get("/", (req, res) => {
    res.send("Digi Saarathi's Backend is Running !!!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
