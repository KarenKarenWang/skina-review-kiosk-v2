"use server";

import {
  getRedis,
  KEY_UNUSED_ZH,
  KEY_USED_ZH,
  KEY_UNUSED_EN,
  KEY_USED_EN,
} from "@/lib/redis";
import { isAdminTokenValid } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(token?: string | null) {
  if (!isAdminTokenValid(token)) {
    throw new Error("Unauthorized: invalid ADMIN_TOKEN");
  }
}

function pickKeys(formData: FormData) {
  const lang = String(formData.get("lang") || "zh") === "en" ? "en" : "zh";
  const KEY_UNUSED = lang === "zh" ? KEY_UNUSED_ZH : KEY_UNUSED_EN;
  const KEY_USED = lang === "zh" ? KEY_USED_ZH : KEY_USED_EN;
  const adminPath = `/admin?lang=${lang}`;
  return { lang, KEY_UNUSED, KEY_USED, adminPath };
}

export async function addOne(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const { KEY_UNUSED, adminPath } = pickKeys(formData);

  const text = String(formData.get("text") || "").trim();
  if (!text) return;

  const redis = getRedis();
  await redis.sadd(KEY_UNUSED, text);

  revalidatePath(adminPath);
}

export async function bulkAdd(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const { KEY_UNUSED, adminPath } = pickKeys(formData);

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

  revalidatePath(adminPath);
}

export async function resetAll(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const { KEY_UNUSED, KEY_USED, adminPath } = pickKeys(formData);

  const redis = getRedis();
  await redis.del(KEY_UNUSED);
  await redis.del(KEY_USED);

  revalidatePath(adminPath);
}

export async function clearUsed(formData: FormData) {
  const token = String(formData.get("token") || "");
  requireAdmin(token);

  const { KEY_USED, adminPath } = pickKeys(formData);

  const redis = getRedis();
  await redis.del(KEY_USED);

  revalidatePath(adminPath);
}
