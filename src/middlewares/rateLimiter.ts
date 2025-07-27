import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "../jobs/redisConnection";

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 100, // Number of requests
  duration: 15 * 60, // Per 15 minutes (in seconds)
});

// Express middleware
export const apiRateLimiter = async (req: any, res: any, next: any) => {
  try {
    await rateLimiter.consume(req.ip); // or req.headers['x-forwarded-for'] for proxies
    next();
  } catch (rejRes) {
    res.status(429).json({
      status: 429,
      message: "Too many requests. Please try again later.",
    });
  }
};
