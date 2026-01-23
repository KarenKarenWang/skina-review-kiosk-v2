// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getRedisSafe, KEY_UNUSED, KEY_USED } from "@/lib/redis";
import { isAdminTokenValid } from "@/lib/auth";

/** 统一的 action 返回类型 */
export type ActionResult =
  | { ok: true; message?: string; added?: number }
  | { ok: false; error: string };

/** 鉴权：永远不 throw */
function checkAdmin(token?: string | null): ActionResult {
  if (!isAdminTokenValid(token)) {
    return { ok: false, error: "Unauthorized: invalid ADMIN_TOKEN" };
  }
  return { ok: true };
}

function normalizeLine(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

/** 统一获取 redis（安全版，不 throw） */
function getRedisOrError(): { redis: any } | { error: string } {
  const r = getRedisSafe();
  if (!r.ok) return { error: r.error };
  return { redis: r.redis };
}

/* =========================
   Add One
   ========================= */
export async function addOne(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const text = normalizeLine(String(formData.get("text") || ""));
    if (!text) return { ok: false, error: "Text is required" };

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    await r.redis.sadd(KEY_UNUSED, text);

    revalidatePath("/admin");
    return { ok: true, message: "Added 1 review", added: 1 };
  } catch (e) {
    console.error("addOne error:", e);
    return { ok: false, error: "Internal error while adding review" };
  }
}

/* =========================
   Bulk Add
   ========================= */
export async function bulkAdd(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const bulk = String(formData.get("bulk") || "").trim();
    if (!bulk) return { ok: false, error: "Bulk text is required" };

    const lines = bulk
      .split(/\r?\n/)
      .map(normalizeLine)
      .filter(Boolean);

    if (lines.length === 0) {
      return { ok: false, error: "No valid lines found" };
    }

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    for (const line of lines) {
      await r.redis.sadd(KEY_UNUSED, line);
    }

    revalidatePath("/admin");
    return {
      ok: true,
      message: `Added ${lines.length} reviews`,
      added: lines.length,
    };
  } catch (e) {
    console.error("bulkAdd error:", e);
    return { ok: false, error: "Internal error while bulk adding" };
  }
}

/* =========================
   Clear Used
   ========================= */
export async function clearUsed(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    await r.redis.del(KEY_USED);

    revalidatePath("/admin");
    return { ok: true, message: "Used pool cleared" };
  } catch (e) {
    console.error("clearUsed error:", e);
    return { ok: false, error: "Internal error while clearing used pool" };
  }
}

/* =========================
   Reset All
   ========================= */
export async function resetAll(formData: FormData): Promise<ActionResult> {
  try {
    const token = String(formData.get("token") || "");
    const auth = checkAdmin(token);
    if (!auth.ok) return auth;

    const r = getRedisOrError();
    if ("error" in r) return { ok: false, error: r.error };

    await r.redis.del(KEY_UNUSED);
    await r.redis.del(KEY_USED);

    revalidatePath("/admin");
    return { ok: true, message: "All pools reset" };
  } catch (e) {
    console.error("resetAll error:", e);
    return { ok: false, error: "Internal error while resetting pools" };
  }
}
