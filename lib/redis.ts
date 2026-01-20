// lib/redis.ts
import { Redis } from "@upstash/redis";

export const KEY_UNUSED_EN = "reviews:unused:en";
export const KEY_USED_EN = "reviews:used:en";

export const KEY_UNUSED_ZH = "reviews:unused:zh";
export const KEY_USED_ZH = "reviews:used:zh";

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
