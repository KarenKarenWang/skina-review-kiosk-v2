// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { isAdminTokenValid } from "@/lib/auth";
import {
  getRedisSafe,
  KEY_UNUSED_EN,
  KEY_USED_EN,
  KEY_UNUSED_ZH,
  KEY_USED_ZH,
} from "@/lib/redis";

export type ActionResult =
  | { ok: true; message?: string; added?: number }
  | { ok: false; error: string };

function checkAdmin(token?: string | null): ActionResult {
  if (!isAdminTokenValid(token)) {
    return { ok: false, error: "Unauthorized: invalid ADMIN_TOKEN" };
  }
  return { ok: true };
}

function normalizeLine(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function parseLang(formData: FormData): "en" | "zh" {
  const lang = String(formData.get("lang") || "").toLowerCase();
  return lang === "en" ? "en" : "zh";
}

function getKeys(lang: "en" | "zh") {
  return lang === "en"
    ? { UNUSED: KEY_UNUSED_EN, USED: KEY_USED_EN }
    : { UNUSED: KEY_UNUSED_ZH, USED: KEY_USED_ZH };
}

function getRedisOrError(): { redis: any } | { error: string } {
  const r = getRedisSafe();
  if (!r.ok) return { error: r.error };
  return { redis: r.redis };
}

export async function addOne(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const lang = parseLang(formData);
    const { UNUSED } = getKeys(lang);

    const text = normalizeLine(String(formData.get("text") || ""));
    if (!text) return { ok: false, error: "Text is required" };

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    await r.redis.sadd(UNUSED, text);

    revalidatePath("/admin");
    return { ok: true, message: `Added 1 (${lang.toUpperCase()})`, added: 1 };
  } catch (e) {
    console.error("addOne error:", e);
    return { ok: false, error: "Internal error while adding" };
  }
}

export async function bulkAdd(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const lang = parseLang(formData);
    const { UNUSED } = getKeys(lang);

    const bulk = String(formData.get("bulk") || "").trim();
    if (!bulk) return { ok: false, error: "Bulk text is required" };

    const lines = bulk
      .split(/\r?\n/)
      .map(normalizeLine)
      .filter(Boolean);

    if (lines.length === 0) return { ok: false, error: "No valid lines found" };

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    for (const line of lines) await r.redis.sadd(UNUSED, line);

    revalidatePath("/admin");
    return {
      ok: true,
      message: `Added ${lines.length} (${lang.toUpperCase()})`,
      added: lines.length,
    };
  } catch (e) {
    console.error("bulkAdd error:", e);
    return { ok: false, error: "Internal error while bulk adding" };
  }
}

export async function clearUsed(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const lang = parseLang(formData);
    const { USED } = getKeys(lang);

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    await r.redis.del(USED);

    revalidatePath("/admin");
    return { ok: true, message: `Cleared used (${lang.toUpperCase()})` };
  } catch (e) {
    console.error("clearUsed error:", e);
    return { ok: false, error: "Internal error while clearing used" };
  }
}

export async function resetAll(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const lang = parseLang(formData);
    const { UNUSED, USED } = getKeys(lang);

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    await r.redis.del(UNUSED);
    await r.redis.del(USED);

    revalidatePath("/admin");
    return { ok: true, message: `Reset all (${lang.toUpperCase()})` };
  } catch (e) {
    console.error("resetAll error:", e);
    return { ok: false, error: "Internal error while resetting pools" };
  }
}
