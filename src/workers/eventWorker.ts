import { Worker } from "bullmq";
import { Event } from "../models/Event";
import { connection } from "../jobs/redisConnection";
import { emitLiveCountUpdate } from "../jobs/socket";

const worker = new Worker(
  "eventQueue",
  async (job) => {
    const { events } = job.data;
    if (!Array.isArray(events) || events.length === 0) {
      throw new Error("No valid events received in job data");
    }

    await Event.insertMany(events);

    console.log(`✅ Inserted ${events.length} events into MongoDB`);
    emitLiveCountUpdate(events.length);
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
