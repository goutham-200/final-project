import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import strategyRoutes from "./routes/strategyRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentPortalRoutes from "./routes/studentPortalRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/strategies", strategyRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student-portal", studentPortalRoutes);
app.use("/api/stats", statsRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "ITSRE API is running." });
});

// Global Error Handlers
app.use(notFound);
app.use(errorHandler);

// Serve Frontend in Production
import path from "path";
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
