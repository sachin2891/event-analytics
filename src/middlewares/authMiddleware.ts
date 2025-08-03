import { Request, Response, NextFunction } from "express";
import { ApiKey } from "../models/ApiKey";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.header("x-api-key");
  // console.log(apiKey);

  if (!apiKey) return res.status(401).json({ error: "API key missing" });

  const keyData = await ApiKey.findOne({ key: apiKey, isActive: true });
  // console.log(keyData);

  if (!keyData)
    return res.status(403).json({ error: "Invalid or inactive API key" });

  req.orgId = keyData.orgId;
  req.projectId = keyData.projectId;

  next();
};
