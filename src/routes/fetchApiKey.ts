import express from "express";
import { ApiKey } from "../models/ApiKey";

const router = express.Router();

router.get("/active", async (req, res) => {
  try {
    const query: any = { isActive: true };
    if (req.orgId) query.orgId = req.orgId;
    if (req.projectId) query.projectId = req.projectId;

    const apiKeys = await ApiKey.find(query).lean();

    const result = apiKeys.map((k) => ({
      _id: k._id?.toString(),
      key: k.key,
      orgId: k.orgId?.toString(),
      projectId: k.projectId?.toString(),
      isActive: k.isActive,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
      __v: k.__v,
    }));

    res.json(result);
  } catch (err) {
    console.error("Fetch API Keys error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// router.get("/key", async (req, res) => {
//   try {
//   } catch (err) {
//     console.error("Fetch API key error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

export default router;
