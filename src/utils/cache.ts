import redisClient from "../jobs/redisConnection";

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 3600 // 1 hour in seconds
): Promise<T> {
  const cached = await redisClient.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const freshData = await fetchFn();
  await redisClient.set(key, JSON.stringify(freshData), "EX", ttl);

  return freshData;
}

export async function invalidateCache(key: string) {
  await redisClient.del(key);
}
