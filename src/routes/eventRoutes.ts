import express from "express";
import { eventSchema } from "../validations/eventSchema";
import { authMiddleware } from "../middlewares/authMiddleware";
import { eventQueue } from "../jobs/eventQueue";
import { emitLiveCountUpdate } from "../jobs/socket";

const router = express.Router();

router.post("/events", authMiddleware, async (req, res) => {
  const events = req.body;

  if (!Array.isArray(events) || events.length === 0 || events.length > 1000) {
    return res
      .status(400)
      .json({ success: false, error: "Must send 1-1000 events in an array" });
  }

  try {
    const seenKeys = new Set<string>();
    const validEvents: any[] = [];

    for (const event of events) {
      const result = eventSchema.safeParse(event);

      if (result.success) {
        const { userId, eventName, timestamp } = result.data;
        const key = `${userId}-${eventName}-${new Date(
          timestamp
        ).toISOString()}`;

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          validEvents.push({
            ...result.data,
            orgId: req.orgId,
            projectId: req.projectId,
          });
        }
      }
    }

    if (validEvents.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No valid events found in payload" });
    }
    const eventCounts: Record<string, number> = {};
    for (const ev of validEvents) {
      eventCounts[ev.eventName] = (eventCounts[ev.eventName] || 0) + 1;
    }
    // console.log(eventCounts);

    for (const [eventName, count] of Object.entries(eventCounts)) {
      // console.log({ eventName, count });

      emitLiveCountUpdate({ eventName, count });
    }

    await eventQueue.add("ingestBatch", { events: validEvents });

    return res.status(200).json({
      success: true,
      message: `Queued ${validEvents.length} event${
        validEvents.length > 1 ? "s" : ""
      }`,
    });
  } catch (err: any) {
    console.error("Error queuing events:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

export default router;
