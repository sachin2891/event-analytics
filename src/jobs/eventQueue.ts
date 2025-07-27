import { Queue } from "bullmq";
import { connection } from "./redisConnection";

export const eventQueue = new Queue("eventQueue", { connection });
