import { NextResponse } from "next/server";
import { isAdminTokenValid } from "@/lib/auth";
import {
  getRedisSafe,
  KEY_UNUSED_EN,
  KEY_UNUSED_ZH,
} from "@/lib/redis";

function keyUnused(lang: "zh" | "en") {
  return lang === "en" ? KEY_UNUSED_EN : KEY_UNUSED_ZH;
}

function normalizeLine(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const token = String(body.token || "");
    if (!isAdminTokenValid(token)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const lang: "zh" | "en" = String(body.lang || "").toLowerCase() === "en" ? "en" : "zh";
    const unusedKey = keyUnused(lang);

    const r = getRedisSafe();
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
    }

    const text = normalizeLine(String(body.text || ""));
    const bulk = String(body.bulk || "").trim();

    let added = 0;

    if (text) {
      await r.redis.sadd(unusedKey, text);
      added += 1;
    }

    if (bulk) {
      const lines = bulk
        .split(/\r?\n/)
        .map(normalizeLine)
        .filter(Boolean);

      for (const line of lines) {
        await r.redis.sadd(unusedKey, line);
        added += 1;
      }
    }

    if (added === 0) {
      return NextResponse.json({ ok: false, error: "No valid text provided" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, lang, added });
  } catch (e) {
    console.error("admin/add error:", e);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
