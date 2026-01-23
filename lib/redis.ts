// lib/redis.ts
import { Redis } from "@upstash/redis";

export const KEY_UNUSED = "skina:review:unused";
export const KEY_USED = "skina:review:used";

let _redis: Redis | null = null;

export type RedisInitResult =
  | { ok: true; redis: Redis }
  | { ok: false; error: string };

export function getRedisSafe(): RedisInitResult {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return {
      ok: false,
      error:
        "Missing Upstash env vars: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN",
    };
  }

  if (!_redis) _redis = new Redis({ url, token });

  return { ok: true, redis: _redis };
}
