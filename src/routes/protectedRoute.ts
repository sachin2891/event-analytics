import { Router, Request, Response } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/protected", authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: "You accessed a protected route!",
    orgId: req.orgId,
    projectId: req.projectId,
  });
});

export default router;
