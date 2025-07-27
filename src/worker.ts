import "./workers/eventWorker";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ Worker connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error in worker:", err);
  });
