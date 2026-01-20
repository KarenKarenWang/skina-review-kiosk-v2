// lib/redis.ts
import { Redis } from "@upstash/redis";

export const KEY_UNUSED = "reviews:unused";
export const KEY_USED = "reviews:used";

// 兼容旧代码：继续提供 redis 常量（其他文件不用改）
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 可选：如果你某些地方也想用 getRedis，也一起保留
let client: Redis | null = null;
export function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
  }
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return client;
}
