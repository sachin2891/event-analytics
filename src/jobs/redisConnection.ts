import { RedisOptions } from "bullmq";
import Redis from "ioredis";

export const connection: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

const redisClient = new Redis(connection);

export default redisClient;
