// lib/redis.ts
import { Redis } from "@upstash/redis";

export const KEY_UNUSED_EN = "skina:review:unused:en";
export const KEY_USED_EN = "skina:review:used:en";
export const KEY_UNUSED_ZH = "skina:review:unused:zh";
export const KEY_USED_ZH = "skina:review:used:zh";

// 兼容旧代码（如果哪里还在用 KEY_UNUSED/KEY_USED）
export const KEY_UNUSED = KEY_UNUSED_ZH;
export const KEY_USED = KEY_USED_ZH;

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

// 兼容你现在 /r/page.tsx 的 import
export function getRedis(): Redis {
  const r = getRedisSafe();
  if (!r.ok) throw new Error(r.error);
  return r.redis;
}
