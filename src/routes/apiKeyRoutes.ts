// routes/apiKeyRoutes.ts
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { ApiKey } from "../models/ApiKey";
import { Organization } from "../models/Organization";
import { Project } from "../models/Project";

const router = express.Router();

router.post("/generate-api-key", async (req, res) => {
  try {
    const { orgName, projectName } = req.body;

    if (!orgName || !projectName) {
      return res
        .status(400)
        .json({ message: "orgName and projectName are required." });
    }

    // Find or create organization
    let org = await Organization.findOne({ name: orgName });
    if (!org) {
      org = await Organization.create({ name: orgName });
    }

    // Find or create project
    let project = await Project.findOne({ name: projectName, orgId: org._id });
    if (!project) {
      project = await Project.create({ name: projectName, orgId: org._id });
    }

    // Generate unique key
    const key = `test-${uuidv4().slice(0, 8)}`;

    const apiKey = await ApiKey.create({
      key,
      orgId: org._id,
      projectId: project._id,
      isActive: true,
    });

    res.status(201).json({
      key: apiKey.key,
      message: `please take a copy of Key : ${key}`,
      orgId: org._id.toString(),
      projectId: project._id.toString(),
    });
  } catch (err) {
    console.error("Error creating API key:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
