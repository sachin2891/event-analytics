import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db";
import protectedRoute from "./routes/protectedRoute";
import eventRoutes from "./routes/eventRoutes";
import apiKeyRoutes from "./routes/apiKeyRoutes";
import analytics from "./routes/analytics";
import { apiRateLimiter } from "./middlewares/rateLimiter";
// import { initSocketIO } from "../src/jobs/socket";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(apiRateLimiter);

// Health check route
app.get("/", (_, res) => res.send("Event Analytics API is running 🚀"));
app.use("/api", protectedRoute);
app.use("/api", eventRoutes);
app.use("/api", apiKeyRoutes);
app.use("/api/events", analytics);

// MongoDB connect
connectDB()
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error", err));

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
