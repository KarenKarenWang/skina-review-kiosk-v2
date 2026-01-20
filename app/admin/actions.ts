"use server";

import { getRedis, KEY_UNUSED, KEY_USED } from "@/lib/redis";
import { isAdminTokenValid } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(token?: string | null) {
  if (!isAdminTokenValid(token)) {
    throw new Error("Unauthorized: invalid ADMIN_TOKEN");
  }
}

export async function addOne(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const text = String(formData.get("text") || "").trim();
  if (!text) return;

  const redis = getRedis();
  await redis.sadd(KEY_UNUSED, text);

  revalidatePath("/admin");
}

export async function bulkAdd(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const bulk = String(formData.get("bulk") || "").trim();
  if (!bulk) return;

  const lines = bulk
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return;

  const redis = getRedis();

  // Upstash sadd 支持多参数，但 TS 类型容易报错；用循环最稳
  for (const line of lines) {
    await redis.sadd(KEY_UNUSED, line);
  }

  revalidatePath("/admin");
}

export async function resetAll(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const redis = getRedis();
  await redis.del(KEY_UNUSED);
  await redis.del(KEY_USED);

  revalidatePath("/admin");
}

export async function clearUsed(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const redis = getRedis();
  await redis.del(KEY_USED);

  revalidatePath("/admin");
}
