import express from "express";
import { Event } from "../models/Event";
import { parsePeriodToDate } from "../utils/parsePeriod";
import { authMiddleware } from "../middlewares/authMiddleware";
import { ObjectId } from "mongodb";
import { PipelineStage } from "mongoose";
import { buildMatchFilter } from "../utils/filters";
// import redisClient from "../jobs/redisConnection";
import { getOrSetCache } from "../utils/cache";

const router = express.Router();

router.get("/metrics", authMiddleware, async (req, res) => {
  const { eventName, period = "7d" } = req.query;

  if (!eventName || typeof eventName !== "string") {
    return res.status(400).json({ error: "eventName is required" });
  }

  const startDate = parsePeriodToDate(period as string);

  if (!req.orgId || !req.projectId) {
    return res.status(400).json({ error: "Missing orgId or projectId" });
  }
  const orgId =
    typeof req.orgId === "string" ? new ObjectId(req.orgId) : req.orgId;
  const projectId =
    typeof req.projectId === "string"
      ? new ObjectId(req.projectId)
      : req.projectId;

  try {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          orgId,
          projectId,
          eventName,
          timestamp: { $gte: startDate },
        },
      },
      {
        $facet: {
          totalEvents: [{ $count: "count" }],
          uniqueUsers: [{ $group: { _id: "$userId" } }, { $count: "count" }],
          dailyBreakdown: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ];

    const result = await Event.aggregate(pipeline);

    const response = {
      eventName,
      totalEvents: result[0]?.totalEvents[0]?.count || 0,
      uniqueUsers: result[0]?.uniqueUsers[0]?.count || 0,
      dailyBreakdown:
        result[0]?.dailyBreakdown.map((d: { _id: string; count: number }) => ({
          date: d._id,
          count: d.count,
        })) || [],
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/funnel", authMiddleware, async (req, res) => {
  const { events, period = "7d" } = req.query;

  if (!events || typeof events !== "string") {
    return res
      .status(400)
      .json({ error: "events query param is required (comma-separated)" });
  }

  const steps = events.split(",").map((e) => e.trim());
  const startDate = parsePeriodToDate(period as string);

  // 💡 Generate a unique cache key based on org, project, period, steps
  const cacheKey = `funnel:${req.orgId}:${req.projectId}:${period}:${steps.join(
    ","
  )}`;

  try {
    const data = await getOrSetCache(cacheKey, async () => {
      // This function is only executed if cache miss occurs

      // Fetch all events in one go
      const allEvents = await Event.find({
        ...buildMatchFilter(req),
        eventName: { $in: steps },
        timestamp: { $gte: startDate },
      }).sort({ userId: 1, timestamp: 1 });

      // Group events by user
      const userEventMap = new Map();
      allEvents.forEach((event) => {
        const userId = event.userId.toString();
        if (!userEventMap.has(userId)) {
          userEventMap.set(userId, []);
        }
        userEventMap.get(userId).push(event.eventName);
      });

      // Funnel logic
      const stepCounts: number[] = [];
      let progressingUsers = Array.from(userEventMap.entries());

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        progressingUsers = progressingUsers.filter(([_, userSteps]) => {
          const currentIndex = userSteps.indexOf(step);
          if (currentIndex === -1) return false;

          if (i === 0) return true;

          const prevIndex = userSteps.indexOf(steps[i - 1]);
          return prevIndex !== -1 && currentIndex > prevIndex;
        });

        stepCounts.push(progressingUsers.length);
      }

      return {
        steps: steps.map((step, index) => ({
          event: step,
          users: stepCounts[index] || 0,
        })),
      };
    });

    res.json(data);
  } catch (err) {
    console.error("Funnel error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/journeys", authMiddleware, async (req, res) => {
  const { period = "7d", limit = 5 } = req.query;
  const startDate = parsePeriodToDate(period as string);

  try {
    const journeys = await Event.aggregate([
      {
        $match: {
          //   orgId: req.orgId,
          //   projectId: req.projectId,
          ...buildMatchFilter(req),
          timestamp: { $gte: startDate },
        },
      },
      {
        $sort: { userId: 1, timestamp: 1 },
      },
      {
        $group: {
          _id: "$userId",
          events: { $push: "$eventName" },
        },
      },
      {
        $limit: parseInt(limit as string),
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          events: 1,
        },
      },
    ]);

    res.json({ journeys });
  } catch (err) {
    console.error("Journey error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/retention", authMiddleware, async (req, res) => {
  const { cohort = "any", period = "7d" } = req.query;
  const startDate = parsePeriodToDate(period as string);

  const cacheKey = `retention:${req.orgId}:${req.projectId}:${cohort}:${period}`;

  try {
    const result = await getOrSetCache(cacheKey, async () => {
      const matchStage: any = {
        ...buildMatchFilter(req),
        timestamp: { $gte: startDate },
      };

      if (cohort !== "any") {
        matchStage.eventName = cohort;
      }

      const firstEvents = await Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$userId",
            firstDate: { $min: "$timestamp" },
          },
        },
      ]);

      const userIds = firstEvents.map((u) => u._id);

      const allEvents = await Event.find({
        orgId: req.orgId,
        projectId: req.projectId,
        userId: { $in: userIds },
        timestamp: { $gte: startDate },
      }).select("userId timestamp");

      const retentionMap: Record<number, Set<string>> = {};

      for (const { _id: userId, firstDate } of firstEvents) {
        const userEvents = allEvents.filter((e) => e.userId === userId);
        const firstDay = new Date(firstDate).setHours(0, 0, 0, 0);
        const seenDays = new Set<number>();

        for (const event of userEvents) {
          const currentDay = new Date(event.timestamp).setHours(0, 0, 0, 0);
          const dayDiff = Math.floor(
            (currentDay - firstDay) / (1000 * 60 * 60 * 24)
          );
          seenDays.add(dayDiff);
        }

        for (const day of seenDays) {
          if (!retentionMap[day]) retentionMap[day] = new Set();
          retentionMap[day].add(userId);
        }
      }

      const retention = Object.entries(retentionMap)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([day, users]) => ({
          day: Number(day),
          users: users.size,
        }));

      return { cohort, retention };
    });

    res.json(result);
  } catch (err) {
    console.error("Retention error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users/:id/journey
router.get("/users/:id/journey", authMiddleware, async (req, res) => {
  const userId = req.params.id;
  const { period = "7d" } = req.query;
  const startDate = parsePeriodToDate(period as string);

  const cacheKey = `journey:${req.orgId}:${req.projectId}:${userId}:${period}`;

  try {
    const data = await getOrSetCache(cacheKey, async () => {
      const events = await Event.find({
        ...buildMatchFilter(req),
        userId,
        timestamp: { $gte: startDate },
      })
        .sort({ timestamp: 1 })
        .select("eventName timestamp -_id");

      return {
        userId,
        events: events.map((e) => ({
          event: e.eventName,
          timestamp: e.timestamp,
        })),
      };
    });

    res.json(data);
  } catch (err) {
    console.error("User Journey error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
